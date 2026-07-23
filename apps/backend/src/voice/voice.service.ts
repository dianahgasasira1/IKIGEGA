import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';

export type ParsedTransactionCandidate = {
  type: 'SALE' | 'PURCHASE' | 'EXPENSE';
  itemName: string;
  quantity: number;
  amount: number;
  confidence: number;
  originalTranscript: string;
};

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly businesses: BusinessesService,
  ) {}

  /**
   * Accept an uploaded audio file, "transcribe" it (currently mocked),
   * store the original audio record, and return a proposed transaction
   * that the user must confirm.
   */
  async ingestAndPropose(
    userId: string,
    audioFile: Express.Multer.File,
  ): Promise<{ audioId: string; proposed: ParsedTransactionCandidate }> {
    if (!audioFile) {
      throw new BadRequestException('No audio file provided');
    }

    const business = await this.businesses.getOrCreateForUser(userId);

    // === MOCK ASR ===
    // In production, we'd send audioFile.buffer/path to an ASR service (MBAZA-NLP,
    // fine-tuned Whisper, or Google Speech-to-Text) and parse the resulting Kinyarwanda
    // transcript into structured data. For now, we return a fixed candidate so we can
    // build the full record → upload → confirm → save flow end-to-end.
    const parsed = this.mockParseAudio(audioFile);

    // We create a "pending" transaction that isn't confirmed yet.
    // The user can accept or reject on the frontend.
    const pendingTx = await this.prisma.transaction.create({
      data: {
        businessId: business.id,
        type: parsed.type,
        itemName: parsed.itemName,
        quantity: parsed.quantity,
        amount: parsed.amount,
        isConfirmed: false,
      },
    });

    // And an OriginalAudio record linked to that transaction
    const audioRecord = await this.prisma.originalAudio.create({
      data: {
        transactionId: pendingTx.id,
        audioBlobUrl: `/uploads/audio/${audioFile.filename}`,
        originalTranscript: parsed.originalTranscript,
        confidence: parsed.confidence,
        consentToKeep: false,
      },
    });

    this.logger.log(
      `Voice ingested for user ${userId}: ${parsed.originalTranscript} → ` +
      `${parsed.type} ${parsed.quantity} × ${parsed.itemName} @ ${parsed.amount}`,
    );

    return {
      audioId: audioRecord.id,
      proposed: parsed,
    };
  }

  /**
   * Confirm a pending transaction created from a voice recording.
   */
  async confirmProposal(userId: string, audioId: string) {
    const audioRecord = await this.prisma.originalAudio.findUnique({
      where: { id: audioId },
      include: { transaction: true },
    });

    if (!audioRecord) {
      throw new NotFoundException('Audio record not found');
    }

    const business = await this.businesses.getByOwnerId(userId);
    if (audioRecord.transaction.businessId !== business.id) {
      throw new NotFoundException('Audio record not found');
    }

    const confirmed = await this.prisma.transaction.update({
      where: { id: audioRecord.transactionId },
      data: { isConfirmed: true },
    });

    this.logger.log(`Voice transaction ${confirmed.id} confirmed`);

    return confirmed;
  }

  /**
   * Reject a proposal — delete the pending transaction and its audio record.
   */
  async rejectProposal(userId: string, audioId: string) {
    const audioRecord = await this.prisma.originalAudio.findUnique({
      where: { id: audioId },
      include: { transaction: true },
    });

    if (!audioRecord) {
      throw new NotFoundException('Audio record not found');
    }

    const business = await this.businesses.getByOwnerId(userId);
    if (audioRecord.transaction.businessId !== business.id) {
      throw new NotFoundException('Audio record not found');
    }

    // Delete the transaction — the audio cascades on delete
    await this.prisma.transaction.delete({
      where: { id: audioRecord.transactionId },
    });

    this.logger.log(`Voice transaction ${audioRecord.transactionId} rejected`);

    return { rejected: true };
  }

  /**
   * === MOCK ASR ===
   * Return a canned parsed transaction. In production, this will call a real
   * ASR service and use a Kinyarwanda number/quantity/item parser.
   */
  private mockParseAudio(audioFile: Express.Multer.File): ParsedTransactionCandidate {
    // Cycle through a few example transcripts to make the demo feel more realistic
    const examples: ParsedTransactionCandidate[] = [
      {
        type: 'SALE',
        itemName: 'ibitunguru',
        quantity: 2,
        amount: 500,
        confidence: 0.86,
        originalTranscript: 'Nagurishije ibitunguru bibiri kuri magana atanu',
      },
      {
        type: 'SALE',
        itemName: 'imbuto',
        quantity: 1,
        amount: 300,
        confidence: 0.78,
        originalTranscript: 'Nagurishije imbuto kuri magana atatu',
      },
      {
        type: 'PURCHASE',
        itemName: 'ifi',
        quantity: 5,
        amount: 2500,
        confidence: 0.82,
        originalTranscript: 'Nguze ifi eshanu kuri ibihumbi bibiri na magana atanu',
      },
      {
        type: 'EXPENSE',
        itemName: 'amazi',
        quantity: 1,
        amount: 200,
        confidence: 0.91,
        originalTranscript: 'Nishyuye amazi magana abiri',
      },
    ];

    // Deterministic pick based on filename hash — so retrying the same "recording"
    // gives the same answer, while different recordings vary.
    const hash = audioFile.filename.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    return examples[hash % examples.length];
  }
}
