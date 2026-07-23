import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    findOne(id: string): Promise<{
        phoneNumber: string;
        preferredName: string | null;
        id: string;
        privatePinHash: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
