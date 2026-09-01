import { IsString, IsNotEmpty, MaxLength, Matches, IsIn, IsOptional, IsInt, Min, IsUUID, IsArray, ArrayUnique } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be in kebab-case format (e.g. market-news)',
  })
  slug!: string;

  @IsString()
  @IsIn(['SERIES', 'COMMUNITY'])
  scope!: 'SERIES' | 'COMMUNITY';

  @IsOptional()
  @IsUUID()
  domainId?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(['SERIES', 'COMMUNITY'], { each: true })
  contentTypes?: Array<'SERIES' | 'COMMUNITY'>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  isPromoted?: boolean;
}
