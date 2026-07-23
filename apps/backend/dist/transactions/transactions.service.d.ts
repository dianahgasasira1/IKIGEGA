import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
    private readonly businesses;
    private readonly logger;
    constructor(prisma: PrismaService, businesses: BusinessesService);
    createForUser(userId: string, dto: CreateTransactionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        itemName: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        amount: import("@prisma/client/runtime/library").Decimal;
        timestamp: Date;
        isConfirmed: boolean;
        businessId: string;
        inventoryItemId: string | null;
    }>;
    listForUser(userId: string, limit?: number): Promise<({
        inventoryItem: {
            name: string;
            unitOfMeasure: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        itemName: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        amount: import("@prisma/client/runtime/library").Decimal;
        timestamp: Date;
        isConfirmed: boolean;
        businessId: string;
        inventoryItemId: string | null;
    })[]>;
    getByIdForUser(userId: string, transactionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        itemName: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        amount: import("@prisma/client/runtime/library").Decimal;
        timestamp: Date;
        isConfirmed: boolean;
        businessId: string;
        inventoryItemId: string | null;
    }>;
}
