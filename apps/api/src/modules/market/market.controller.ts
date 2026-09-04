import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { MarketService } from './market.service';
import { MarketTickerItem } from './market.types';

@ApiTags('Market')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Public()
  @Get('ticker')
  @ApiOperation({ summary: 'Get real-time financial market ticker indices & stocks' })
  @ApiResponse({
    status: 200,
    description: 'List of real-time market indices, stocks, gold, fx, and crypto ticker items',
  })
  async getTicker(): Promise<MarketTickerItem[]> {
    return this.marketService.getTicker();
  }
}
