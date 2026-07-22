import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { amountToKinyarwanda } from '../common/kinyarwanda-numbers';

export type DailySummary = {
  date: string;
  revenue: number;
  expenses: number;
  purchases: number;
  netProfit: number;
  transactionCount: number;
  spokenKinyarwanda: string;
  spokenEnglish: string;
};

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly businesses: BusinessesService,
  ) {}

  /**
   * Return today's summary for the user's business.
   */
  async getTodayForUser(userId: string): Promise<DailySummary> {
    const business = await this.businesses.getOrCreateForUser(userId);

    // Compute the day boundaries in the server's local timezone.
    // Later we'll respect the user's timezone from their profile.
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        businessId: business.id,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        type: true,
        amount: true,
      },
    });

    let revenue = 0;
    let expenses = 0;
    let purchases = 0;

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      if (tx.type === 'SALE') revenue += amount;
      else if (tx.type === 'PURCHASE') purchases += amount;
      else if (tx.type === 'EXPENSE') expenses += amount;
    }

    const netProfit = revenue - expenses - purchases;

    const summary: DailySummary = {
      date: startOfDay.toISOString().split('T')[0],
      revenue,
      expenses,
      purchases,
      netProfit,
      transactionCount: transactions.length,
      spokenKinyarwanda: this.formatKinyarwanda(revenue, expenses + purchases, netProfit, transactions.length),
      spokenEnglish: this.formatEnglish(revenue, expenses + purchases, netProfit, transactions.length),
    };

    this.logger.log(`Summary for user ${userId}: rev=${revenue}, cost=${expenses + purchases}, net=${netProfit}`);

    return summary;
  }

  private formatKinyarwanda(
    revenue: number,
    costs: number,
    net: number,
    txCount: number,
  ): string {
    if (txCount === 0) {
      return 'Uyu munsi ntabwo hari ubwanditse.';
    }

    const revenuePhrase = amountToKinyarwanda(revenue);
    const costsPhrase = amountToKinyarwanda(costs);

    if (net >= 0) {
      const profitPhrase = amountToKinyarwanda(net);
      return `Uyu munsi wagurishije ${revenuePhrase}, wakoresheje ${costsPhrase}. Wungutse ${profitPhrase}.`;
    } else {
      const lossPhrase = amountToKinyarwanda(Math.abs(net));
      return `Uyu munsi wagurishije ${revenuePhrase}, wakoresheje ${costsPhrase}. Wahombye ${lossPhrase}.`;
    }
  }

  private formatEnglish(
    revenue: number,
    costs: number,
    net: number,
    txCount: number,
  ): string {
    if (txCount === 0) {
      return 'No transactions logged today.';
    }

    const rev = revenue.toLocaleString();
    const cost = costs.toLocaleString();
    const netAbs = Math.abs(net).toLocaleString();

    if (net >= 0) {
      return `Today you sold ${rev} RWF, spent ${cost} RWF. Net profit: ${netAbs} RWF.`;
    } else {
      return `Today you sold ${rev} RWF, spent ${cost} RWF. Net loss: ${netAbs} RWF.`;
    }
  }
}
