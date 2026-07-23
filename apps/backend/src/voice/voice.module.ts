import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [BusinessesModule, AuthModule],
  controllers: [VoiceController],
  providers: [VoiceService],
})
export class VoiceModule {}
