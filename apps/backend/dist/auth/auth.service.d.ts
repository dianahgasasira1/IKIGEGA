import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly logger;
    private readonly OTP_EXPIRY_MINUTES;
    private readonly BCRYPT_ROUNDS;
    constructor(prisma: PrismaService, jwt: JwtService);
    requestOtp(dto: RegisterDto): Promise<{
        message: string;
        phoneNumber: string;
        expiresInMinutes: number;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        token: string;
        user: {
            id: string;
            phoneNumber: string;
            preferredName: string | null;
        };
    }>;
    getUserById(userId: string): Promise<{
        id: string;
        phoneNumber: string;
        preferredName: string | null;
        createdAt: Date;
    }>;
}
