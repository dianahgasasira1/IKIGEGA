import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
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
export declare class SummaryService {
    private readonly prisma;
    private readonly businesses;
    private readonly logger;
    constructor(prisma: PrismaService, businesses: BusinessesService);
    getTodayForUser(userId: string): Promise<DailySummary>;
    private formatKinyarwanda;
    private formatEnglish;
}
