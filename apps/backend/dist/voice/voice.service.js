"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const businesses_service_1 = require("../businesses/businesses.service");
let VoiceService = VoiceService_1 = class VoiceService {
    prisma;
    businesses;
    logger = new common_1.Logger(VoiceService_1.name);
    constructor(prisma, businesses) {
        this.prisma = prisma;
        this.businesses = businesses;
    }
    async ingestAndPropose(userId, audioFile) {
        if (!audioFile) {
            throw new common_1.BadRequestException('No audio file provided');
        }
        const business = await this.businesses.getOrCreateForUser(userId);
        const parsed = this.mockParseAudio(audioFile);
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
        const audioRecord = await this.prisma.originalAudio.create({
            data: {
                transactionId: pendingTx.id,
                audioBlobUrl: `/uploads/audio/${audioFile.filename}`,
                originalTranscript: parsed.originalTranscript,
                confidence: parsed.confidence,
                consentToKeep: false,
            },
        });
        this.logger.log(`Voice ingested for user ${userId}: ${parsed.originalTranscript} → ` +
            `${parsed.type} ${parsed.quantity} × ${parsed.itemName} @ ${parsed.amount}`);
        return {
            audioId: audioRecord.id,
            proposed: parsed,
        };
    }
    async confirmProposal(userId, audioId) {
        const audioRecord = await this.prisma.originalAudio.findUnique({
            where: { id: audioId },
            include: { transaction: true },
        });
        if (!audioRecord) {
            throw new common_1.NotFoundException('Audio record not found');
        }
        const business = await this.businesses.getByOwnerId(userId);
        if (audioRecord.transaction.businessId !== business.id) {
            throw new common_1.NotFoundException('Audio record not found');
        }
        const confirmed = await this.prisma.transaction.update({
            where: { id: audioRecord.transactionId },
            data: { isConfirmed: true },
        });
        this.logger.log(`Voice transaction ${confirmed.id} confirmed`);
        return confirmed;
    }
    async rejectProposal(userId, audioId) {
        const audioRecord = await this.prisma.originalAudio.findUnique({
            where: { id: audioId },
            include: { transaction: true },
        });
        if (!audioRecord) {
            throw new common_1.NotFoundException('Audio record not found');
        }
        const business = await this.businesses.getByOwnerId(userId);
        if (audioRecord.transaction.businessId !== business.id) {
            throw new common_1.NotFoundException('Audio record not found');
        }
        await this.prisma.transaction.delete({
            where: { id: audioRecord.transactionId },
        });
        this.logger.log(`Voice transaction ${audioRecord.transactionId} rejected`);
        return { rejected: true };
    }
    mockParseAudio(audioFile) {
        const examples = [
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
        const hash = audioFile.filename.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
        return examples[hash % examples.length];
    }
};
exports.VoiceService = VoiceService;
exports.VoiceService = VoiceService = VoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        businesses_service_1.BusinessesService])
], VoiceService);
//# sourceMappingURL=voice.service.js.map