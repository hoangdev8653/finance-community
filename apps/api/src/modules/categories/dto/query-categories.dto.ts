import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryCategoriesDto {
  @IsOptional()
  @IsString()
  @IsIn(['SERIES', 'COMMUNITY'])
  scope?: 'SERIES' | 'COMMUNITY';
}
