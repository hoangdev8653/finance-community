import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { DomainsRepository } from '../../database/repositories/domains.repository';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DomainsController],
  providers: [DomainsRepository, DomainsService],
  exports: [DomainsService],
})
export class DomainsModule {}
