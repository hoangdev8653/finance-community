import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { SystemSettingsRepository } from '../../database/repositories/system-settings.repository';

@Module({
  controllers: [MarketController],
  providers: [MarketService, SystemSettingsRepository],
  exports: [MarketService],
})
export class MarketModule {}
