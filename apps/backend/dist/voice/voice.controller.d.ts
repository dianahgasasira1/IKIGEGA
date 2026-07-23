import { VoiceService } from './voice.service';
import type { AuthenticatedUser } from '../auth/current-user.decorator';
export declare class VoiceController {
    private readonly voice;
    constructor(voice: VoiceService);
    logSale(user: AuthenticatedUser, audio: Express.Multer.File): Promise<{
        audioId: string;
        proposed: import("./voice.service").ParsedTransactionCandidate;
    }>;
    confirm(user: AuthenticatedUser, audioId: string): Promise<{
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
    reject(user: AuthenticatedUser, audioId: string): Promise<{
        rejected: boolean;
    }>;
}
