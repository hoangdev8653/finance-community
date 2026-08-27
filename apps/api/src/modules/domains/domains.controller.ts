import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { DomainsService } from './domains.service';

@ApiTags('Domains')
@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get active content domains' })
  @ApiResponse({ status: 200, description: 'Array of DomainEntity objects' })
  getDomains() {
    return this.domainsService.getDomains();
  }
}
