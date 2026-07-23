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
export declare class VoiceService {
    private readonly prisma;
    private readonly businesses;
    private readonly logger;
    constructor(prisma: PrismaService, businesses: BusinessesService);
    ingestAndPropose(userId: string, audioFile: Express.Multer.File): Promise<{
        audioId: string;
        proposed: ParsedTransactionCandidate;
    }>;
    confirmProposal(userId: string, audioId: string): Promise<{
        id: string;
        businessId: string;
        type: import("@prisma/client").$Enums.TransactionType;
        itemName: string;
        inventoryItemId: string | null;
        quantity: import("@prisma/client/runtime/library").Decimal;
        amount: import("@prisma/client/runtime/library").Decimal;
        timestamp: Date;
        isConfirmed: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    rejectProposal(userId: string, audioId: string): Promise<{
        rejected: boolean;
    }>;
    private mockParseAudio;
}
