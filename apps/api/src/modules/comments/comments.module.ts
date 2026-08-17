import { Module, forwardRef } from '@nestjs/common';
import { CommentsService } from './services/comments.service';
import { CommentsController } from './controllers/comments.controller';
import { CommentsRepository } from '../../database/repositories/comments.repository';
import { DatabaseModule } from '../../database/database.module';
import { PostsModule } from '../posts/posts.module';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DatabaseModule,
    PostsModule,
    AuditModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService, CommentsRepository],
})
export class CommentsModule {}
