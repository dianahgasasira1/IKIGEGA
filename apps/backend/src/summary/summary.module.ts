import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BusinessesModule, AuthModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
