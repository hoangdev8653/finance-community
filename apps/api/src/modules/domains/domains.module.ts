import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DomainsRepository } from '../../database/repositories/domains.repository';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [DomainsController],
  providers: [DomainsRepository, DomainsService],
  exports: [DomainsService, DomainsRepository],
})
export class DomainsModule {}
