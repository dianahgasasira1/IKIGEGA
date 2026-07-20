import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    findOne(id: string): Promise<{
        id: string;
        phoneNumber: string;
        preferredName: string | null;
        privatePinHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
