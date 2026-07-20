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
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const businesses_service_1 = require("../businesses/businesses.service");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    prisma;
    businesses;
    logger = new common_1.Logger(TransactionsService_1.name);
    constructor(prisma, businesses) {
        this.prisma = prisma;
        this.businesses = businesses;
    }
    async createForUser(userId, dto) {
        const business = await this.businesses.getOrCreateForUser(userId);
        const inventoryItem = await this.prisma.inventoryItem.findFirst({
            where: {
                businessId: business.id,
                name: dto.itemName,
            },
        });
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
        this.logger.log(`${dto.type} logged for user ${userId}: ${dto.quantity ?? 1} × ${dto.itemName} @ ${dto.amount}`);
        return created;
    }
    async listForUser(userId, limit = 20) {
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
    async getByIdForUser(userId, transactionId) {
        const business = await this.businesses.getByOwnerId(userId);
        const tx = await this.prisma.transaction.findFirst({
            where: {
                id: transactionId,
                businessId: business.id,
            },
        });
        if (!tx) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return tx;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        businesses_service_1.BusinessesService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map