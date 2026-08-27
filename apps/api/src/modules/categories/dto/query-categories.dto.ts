import { IsOptional, IsString, IsIn, IsUUID, IsBoolean } from 'class-validator';

export class QueryCategoriesDto {
  @IsOptional()
  @IsString()
  @IsIn(['SERIES', 'COMMUNITY', 'NEWS'])
  scope?: 'SERIES' | 'COMMUNITY' | 'NEWS';

  @IsOptional()
  @IsUUID()
  domainId?: string;

  @IsOptional()
  @IsString()
  contentType?: 'SERIES' | 'COMMUNITY' | 'NEWS';

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
