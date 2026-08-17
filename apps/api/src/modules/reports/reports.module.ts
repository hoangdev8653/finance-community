import { Module, forwardRef } from '@nestjs/common';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './controllers/reports.controller';
import { ReportsRepository } from '../../database/repositories/reports.repository';
import { ProfilesRepository } from '../../database/repositories/profiles.repository';
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
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository, ProfilesRepository],
  exports: [ReportsService, ReportsRepository],
})
export class ReportsModule {}
