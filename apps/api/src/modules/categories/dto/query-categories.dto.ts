import { IsOptional, IsString, IsIn, IsUUID, IsBoolean } from 'class-validator';

export class QueryCategoriesDto {
  @IsOptional()
  @IsString()
  @IsIn(['SERIES', 'COMMUNITY'])
  scope?: 'SERIES' | 'COMMUNITY';

  @IsOptional()
  @IsUUID()
  domainId?: string;

  @IsOptional()
  @IsString()
  contentType?: 'SERIES' | 'COMMUNITY';

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
