import { Module, forwardRef } from '@nestjs/common';
import { ModerationService } from './services/moderation.service';
import { ModerationController } from './controllers/moderation.controller';
import { ModerationActionsRepository } from '../../database/repositories/moderation-actions.repository';
import { PostsRepository } from '../../database/repositories/posts.repository';
import { CommentsRepository } from '../../database/repositories/comments.repository';
import { UsersRepository } from '../../database/repositories/users.repository';
import { DatabaseModule } from '../../database/database.module';
import { ReportsModule } from '../reports/reports.module';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    ReportsModule,
    AuditModule,
    NotificationsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [ModerationController],
  providers: [
    ModerationService,
    ModerationActionsRepository,
    PostsRepository,
    CommentsRepository,
    UsersRepository,
  ],
  exports: [ModerationService, ModerationActionsRepository],
})
export class ModerationModule {}
