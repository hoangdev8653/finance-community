import {
  IsOptional,
  IsString,
  MaxLength,
  IsIn,
  IsUUID,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  domainId?: string;

  @IsOptional()
  @IsUUID()
  coverMediaId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  mediaIds?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'HIDDEN'])
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'HIDDEN';

  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @IsIn(['AI_CURATED', 'EDITORIAL', 'USER'])
  sourceType?: 'AI_CURATED' | 'EDITORIAL' | 'USER';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceName?: string;
}
