import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';
import { PostsRepository } from '../../database/repositories/posts.repository';
import { PostTagsRepository } from '../../database/repositories/post-tags.repository';
import { PostMediaRepository } from '../../database/repositories/post-media.repository';
import { DatabaseModule } from '../../database/database.module';
import { CategoriesModule } from '../categories/categories.module';
import { MediaModule } from '../media/media.module';
import { TagsModule } from '../tags/tags.module';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    DatabaseModule,
    CategoriesModule,
    MediaModule,
    TagsModule,
    forwardRef(() => UsersModule),
    AuditModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostTagsRepository,
    PostMediaRepository,
  ],
  exports: [
    PostsService,
    PostsRepository,
    PostTagsRepository,
    PostMediaRepository,
  ],
})
export class PostsModule {}
