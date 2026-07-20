import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(dto: CreateUserDto): Promise<{
        id: string;
        phoneNumber: string;
        preferredName: string | null;
        privatePinHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        phoneNumber: string;
        preferredName: string | null;
        privatePinHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        phoneNumber: string;
        preferredName: string | null;
        privatePinHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
