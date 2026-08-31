import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class QueryLearningPostsDto {
  @IsOptional() @IsIn(['DRAFT', 'REVIEW', 'PUBLISHED', 'NEEDS_UPDATE', 'ARCHIVED'])
  editorialStatus?: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'NEEDS_UPDATE' | 'ARCHIVED';

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 20;
}
