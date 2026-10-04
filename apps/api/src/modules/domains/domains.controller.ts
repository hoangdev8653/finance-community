import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../auth/guards/account-status.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { QueryDomainsDto } from './dto/query-domains.dto';

@ApiTags('Domains')
@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get active content domains or all domains with counts' })
  @ApiResponse({ status: 200, description: 'Array of DomainEntity objects with counts' })
  getDomains(@Query() query: QueryDomainsDto) {
    return this.domainsService.getDomains(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get domain detail by ID' })
  @ApiResponse({ status: 200, description: 'DomainEntity object with counts' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  getDomain(@Param('id') id: string) {
    return this.domainsService.getDomainById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new content domain (Requires categories:manage permission)' })
  @ApiResponse({ status: 201, description: 'Created DomainEntity' })
  @ApiResponse({ status: 403, description: 'Permission categories:manage required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('categories:manage')
  createDomain(@Body() dto: CreateDomainDto) {
    return this.domainsService.createDomain(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update existing domain (Requires categories:manage permission)' })
  @ApiResponse({ status: 200, description: 'Updated DomainEntity' })
  @ApiResponse({ status: 403, description: 'Permission categories:manage required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('categories:manage')
  updateDomain(@Param('id') id: string, @Body() dto: UpdateDomainDto) {
    return this.domainsService.updateDomain(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete domain (Requires categories:manage permission)' })
  @ApiResponse({ status: 200, description: 'Deleted DomainEntity' })
  @ApiResponse({ status: 400, description: 'Domain has associated categories or courses' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, PermissionGuard)
  @RequirePermission('categories:manage')
  deleteDomain(@Param('id') id: string) {
    return this.domainsService.deleteDomain(id);
  }
}
