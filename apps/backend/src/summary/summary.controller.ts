import { Controller, Get, UseGuards } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/current-user.decorator';

@Controller('summary')
@UseGuards(JwtAuthGuard)
export class SummaryController {
  constructor(private readonly summary: SummaryService) {}

  @Get('today')
  getToday(@CurrentUser() user: AuthenticatedUser) {
    return this.summary.getTodayForUser(user.userId);
  }
}
