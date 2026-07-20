import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import type { AuthenticatedUser } from './current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
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
    getMe(user: AuthenticatedUser): Promise<{
        id: string;
        phoneNumber: string;
        preferredName: string | null;
        createdAt: Date;
    }>;
}
