import { Module } from '@nestjs/common';
import { SeriesService } from './services/series.service';
import { SeriesController } from './controllers/series.controller';
import { DatabaseModule } from '../../database/database.module';
import { CategoriesModule } from '../categories/categories.module';
import { PostsModule } from '../posts/posts.module';
import { LearningSeriesRepository } from '../../database/repositories/learning-series.repository';
import { LearningSeriesService } from './services/learning-series.service';
import { UsersModule } from '../users/users.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [DatabaseModule, CategoriesModule, PostsModule, UsersModule, MediaModule],
  controllers: [SeriesController],
  providers: [SeriesService, LearningSeriesRepository, LearningSeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
