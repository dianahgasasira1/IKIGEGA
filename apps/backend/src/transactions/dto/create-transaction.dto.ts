import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionTypeDto {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  EXPENSE = 'EXPENSE',
}

export class CreateTransactionDto {
  @IsEnum(TransactionTypeDto, {
    message: 'type must be one of: SALE, PURCHASE, EXPENSE',
  })
  type!: TransactionTypeDto;

  @IsString()
  @IsNotEmpty({ message: 'itemName is required' })
  @MaxLength(100)
  itemName!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'quantity must be positive' })
  @IsOptional()
  quantity?: number = 1;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'amount cannot be negative' })
  amount!: number;
}
