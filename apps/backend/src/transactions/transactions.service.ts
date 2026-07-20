import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly businesses: BusinessesService,
  ) {}

  /**
   * Create a transaction for the user's business.
   * If the user has no business yet, one is auto-created.
   * If the itemName matches an existing InventoryItem, we link it and adjust stock.
   */
  async createForUser(userId: string, dto: CreateTransactionDto) {
    const business = await this.businesses.getOrCreateForUser(userId);

    // Attempt to match this item to an existing inventory record for this business
    const inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: {
        businessId: business.id,
        name: dto.itemName,
      },
    });

    // Use a transaction (in the DB sense) to keep the two writes atomic
    const created = await this.prisma.$transaction(async (tx) => {
      const newTx = await tx.transaction.create({
        data: {
          businessId: business.id,
          inventoryItemId: inventoryItem?.id,
          type: dto.type,
          itemName: dto.itemName,
          quantity: dto.quantity ?? 1,
          amount: dto.amount,
          isConfirmed: true,
        },
      });

      // If it's a SALE and we have inventory, decrement
      if (inventoryItem && dto.type === 'SALE') {
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            currentStock: {
              decrement: dto.quantity ?? 1,
            },
          },
        });
      }

      // If it's a PURCHASE and we have inventory, increment
      if (inventoryItem && dto.type === 'PURCHASE') {
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            currentStock: {
              increment: dto.quantity ?? 1,
            },
          },
        });
      }

      return newTx;
    });

    this.logger.log(
      `${dto.type} logged for user ${userId}: ${dto.quantity ?? 1} × ${dto.itemName} @ ${dto.amount}`,
    );

    return created;
  }

  async listForUser(userId: string, limit = 20) {
    const business = await this.businesses.getOrCreateForUser(userId);

    return this.prisma.transaction.findMany({
      where: { businessId: business.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        inventoryItem: {
          select: { name: true, unitOfMeasure: true },
        },
      },
    });
  }

  async getByIdForUser(userId: string, transactionId: string) {
    const business = await this.businesses.getByOwnerId(userId);

    const tx = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        businessId: business.id,
      },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    return tx;
  }
}
