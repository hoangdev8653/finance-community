import { IsOptional, IsString, MaxLength, IsInt, Min, IsUUID, IsArray, ArrayUnique, IsIn, IsBoolean } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  domainId?: string | null;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(['SERIES', 'COMMUNITY', 'NEWS'], { each: true })
  contentTypes?: Array<'SERIES' | 'COMMUNITY' | 'NEWS'>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPromoted?: boolean;
}
