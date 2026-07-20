export declare enum TransactionTypeDto {
    SALE = "SALE",
    PURCHASE = "PURCHASE",
    EXPENSE = "EXPENSE"
}
export declare class CreateTransactionDto {
    type: TransactionTypeDto;
    itemName: string;
    quantity?: number;
    amount: number;
}
