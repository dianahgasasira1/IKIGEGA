import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Generate a fresh OTP for this phone number.
   * Any previous unused OTPs for this phone are invalidated.
   */
  async requestOtp(dto: RegisterDto) {
    // Invalidate any previous unused OTPs for this phone
    await this.prisma.otpRequest.updateMany({
      where: {
        phoneNumber: dto.phoneNumber,
        consumed: false,
      },
      data: { consumed: true },
    });

    // Generate a random 6-digit code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, this.BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store the hashed OTP
    await this.prisma.otpRequest.create({
      data: {
        phoneNumber: dto.phoneNumber,
        otpHash,
        expiresAt,
      },
    });

    // For now, "send" by logging to console.
    // In a later sprint we'll swap this for Africa's Talking SMS.
    this.logger.log(`OTP for ${dto.phoneNumber} is ${otp} (expires in ${this.OTP_EXPIRY_MINUTES} min)`);

    return {
      message: 'OTP sent',
      phoneNumber: dto.phoneNumber,
      expiresInMinutes: this.OTP_EXPIRY_MINUTES,
    };
  }

  /**
   * Verify an OTP and either sign in an existing user or create a new one.
   * Returns a JWT on success.
   */
  async verifyOtp(dto: VerifyOtpDto) {
    // Find the most recent unconsumed OTP for this phone
    const otpRecord = await this.prisma.otpRequest.findFirst({
      where: {
        phoneNumber: dto.phoneNumber,
        consumed: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('No pending OTP for this phone number. Request a new one.');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired. Request a new one.');
    }

    const otpMatches = await bcrypt.compare(dto.otp, otpRecord.otpHash);
    if (!otpMatches) {
      throw new UnauthorizedException('Invalid OTP.');
    }

    // Mark this OTP as consumed — one-time use, no replay
    await this.prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { consumed: true },
    });

    // Find or create the user
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phoneNumber: dto.phoneNumber,
          preferredName: dto.preferredName,
        },
      });
      this.logger.log(`New user registered: ${user.id} (${user.phoneNumber})`);
    } else if (dto.preferredName && !user.preferredName) {
      // If the user exists but has no name, and one was provided now, set it
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { preferredName: dto.preferredName },
      });
    }

    // Sign a JWT with the user's ID as the "subject"
    const token = await this.jwt.signAsync({
      sub: user.id,
      phoneNumber: user.phoneNumber,
    });

    return {
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        preferredName: user.preferredName,
      },
    };
  }

  /**
   * Given a user ID (from a verified JWT), return the user's profile.
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      preferredName: user.preferredName,
      createdAt: user.createdAt,
    };
  }
}
