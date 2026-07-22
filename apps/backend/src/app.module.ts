import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, BusinessesModule, TransactionsModule, SummaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
