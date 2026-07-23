import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import type { AuthenticatedUser } from '../auth/current-user.decorator';
export declare class TransactionsController {
    private readonly transactions;
    constructor(transactions: TransactionsService);
    create(user: AuthenticatedUser, dto: CreateTransactionDto): Promise<{
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
    list(user: AuthenticatedUser, limit?: string): Promise<({
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
    getOne(user: AuthenticatedUser, id: string): Promise<{
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
