import { IsOptional, IsString, IsIn, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPostsDto {
  @IsOptional()
  @IsString()
  @IsIn(['SERIES', 'COMMUNITY', 'NEWS'])
  contentType?: 'SERIES' | 'COMMUNITY' | 'NEWS';

  @IsOptional()
  @IsString()
  @IsIn(['AI_CURATED', 'EDITORIAL', 'USER'])
  sourceType?: 'AI_CURATED' | 'EDITORIAL' | 'USER';

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  tagId?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN'])
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(['publishedAt', 'createdAt'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}
