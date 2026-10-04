import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDomainsDto {
  @ApiPropertyOptional({ description: 'Include inactive domains in result' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Search domain by name, code or slug' })
  @IsOptional()
  @IsString()
  search?: string;
}
