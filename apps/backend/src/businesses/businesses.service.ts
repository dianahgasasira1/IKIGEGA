import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Return the user's business, creating a default one if they don't have one yet.
   */
  async getOrCreateForUser(userId: string) {
    const existing = await this.prisma.business.findUnique({
      where: { ownerId: userId },
    });

    if (existing) return existing;

    return this.prisma.business.create({
      data: {
        ownerId: userId,
      },
    });
  }

  async getByOwnerId(userId: string) {
    const business = await this.prisma.business.findUnique({
      where: { ownerId: userId },
    });

    if (!business) {
      throw new NotFoundException('No business found for this user');
    }

    return business;
  }
}
