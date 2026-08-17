import { Module } from '@nestjs/common';
import { TagsService } from './services/tags.service';
import { TagsController } from './controllers/tags.controller';
import { TagsRepository } from '../../database/repositories/tags.repository';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [TagsController],
  providers: [TagsService, TagsRepository],
  exports: [TagsService, TagsRepository],
})
export class TagsModule {}
