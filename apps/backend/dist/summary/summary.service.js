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
var SummaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const businesses_service_1 = require("../businesses/businesses.service");
const kinyarwanda_numbers_1 = require("../common/kinyarwanda-numbers");
let SummaryService = SummaryService_1 = class SummaryService {
    prisma;
    businesses;
    logger = new common_1.Logger(SummaryService_1.name);
    constructor(prisma, businesses) {
        this.prisma = prisma;
        this.businesses = businesses;
    }
    async getTodayForUser(userId) {
        const business = await this.businesses.getOrCreateForUser(userId);
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
            if (tx.type === 'SALE')
                revenue += amount;
            else if (tx.type === 'PURCHASE')
                purchases += amount;
            else if (tx.type === 'EXPENSE')
                expenses += amount;
        }
        const netProfit = revenue - expenses - purchases;
        const summary = {
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
    formatKinyarwanda(revenue, costs, net, txCount) {
        if (txCount === 0) {
            return 'Uyu munsi ntabwo hari ubwanditse.';
        }
        const revenuePhrase = (0, kinyarwanda_numbers_1.amountToKinyarwanda)(revenue);
        const costsPhrase = (0, kinyarwanda_numbers_1.amountToKinyarwanda)(costs);
        if (net >= 0) {
            const profitPhrase = (0, kinyarwanda_numbers_1.amountToKinyarwanda)(net);
            return `Uyu munsi wagurishije ${revenuePhrase}, wakoresheje ${costsPhrase}. Wungutse ${profitPhrase}.`;
        }
        else {
            const lossPhrase = (0, kinyarwanda_numbers_1.amountToKinyarwanda)(Math.abs(net));
            return `Uyu munsi wagurishije ${revenuePhrase}, wakoresheje ${costsPhrase}. Wahombye ${lossPhrase}.`;
        }
    }
    formatEnglish(revenue, costs, net, txCount) {
        if (txCount === 0) {
            return 'No transactions logged today.';
        }
        const rev = revenue.toLocaleString();
        const cost = costs.toLocaleString();
        const netAbs = Math.abs(net).toLocaleString();
        if (net >= 0) {
            return `Today you sold ${rev} RWF, spent ${cost} RWF. Net profit: ${netAbs} RWF.`;
        }
        else {
            return `Today you sold ${rev} RWF, spent ${cost} RWF. Net loss: ${netAbs} RWF.`;
        }
    }
};
exports.SummaryService = SummaryService;
exports.SummaryService = SummaryService = SummaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        businesses_service_1.BusinessesService])
], SummaryService);
//# sourceMappingURL=summary.service.js.map