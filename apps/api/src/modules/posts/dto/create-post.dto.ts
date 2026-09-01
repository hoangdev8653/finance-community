import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsIn,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsString()
  @IsIn(['SERIES', 'COMMUNITY'])
  contentType!: 'SERIES' | 'COMMUNITY';

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
  @IsArray()
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  topics?: string[];

  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status!: 'DRAFT' | 'PUBLISHED';

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
