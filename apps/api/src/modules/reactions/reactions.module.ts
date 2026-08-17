import { Module, forwardRef } from '@nestjs/common';
import { ReactionsService } from './services/reactions.service';
import { ReactionsController } from './controllers/reactions.controller';
import { PostReactionsRepository } from '../../database/repositories/post-reactions.repository';
import { CommentReactionsRepository } from '../../database/repositories/comment-reactions.repository';
import { DatabaseModule } from '../../database/database.module';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DatabaseModule,
    PostsModule,
    CommentsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [ReactionsController],
  providers: [ReactionsService, PostReactionsRepository, CommentReactionsRepository],
  exports: [ReactionsService, PostReactionsRepository, CommentReactionsRepository],
})
export class ReactionsModule {}
