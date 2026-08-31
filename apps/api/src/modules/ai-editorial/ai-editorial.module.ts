import { Module } from '@nestjs/common';
import { AiEditorialController } from './ai-editorial.controller';
import { AiEditorialService } from './ai-editorial.service';
import { AuthModule } from '../auth/auth.module';

@Module({ imports: [AuthModule], controllers: [AiEditorialController], providers: [AiEditorialService] })
export class AiEditorialModule {}
