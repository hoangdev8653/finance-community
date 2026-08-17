import { Module, forwardRef } from '@nestjs/common';
import { FollowsService } from './services/follows.service';
import { FollowsController } from './controllers/follows.controller';
import { FollowsRepository } from '../../database/repositories/follows.repository';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [FollowsController],
  providers: [FollowsService, FollowsRepository],
  exports: [FollowsService, FollowsRepository],
})
export class FollowsModule {}
