import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<{
        phoneNumber: string;
        preferredName: string | null;
        id: string;
        privatePinHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        phoneNumber: string;
        preferredName: string | null;
        id: string;
        privatePinHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<{
        phoneNumber: string;
        preferredName: string | null;
        id: string;
        privatePinHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
