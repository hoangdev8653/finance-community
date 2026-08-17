import { Module } from '@nestjs/common';
import { SeriesService } from './services/series.service';
import { SeriesController } from './controllers/series.controller';
import { DatabaseModule } from '../../database/database.module';
import { CategoriesModule } from '../categories/categories.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [DatabaseModule, CategoriesModule, PostsModule],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
