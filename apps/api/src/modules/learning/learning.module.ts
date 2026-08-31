import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { LearningController } from './controllers/learning.controller';
import { LearningService } from './services/learning.service';
import { AuditModule } from '../../modules/audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuditModule, AuthModule],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
