import { PrismaService } from '../prisma/prisma.service';
export declare class BusinessesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getOrCreateForUser(userId: string): Promise<{
        id: string;
        ownerId: string;
        businessType: import("@prisma/client").$Enums.BusinessType;
        primaryProducts: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    getByOwnerId(userId: string): Promise<{
        id: string;
        ownerId: string;
        businessType: import("@prisma/client").$Enums.BusinessType;
        primaryProducts: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
