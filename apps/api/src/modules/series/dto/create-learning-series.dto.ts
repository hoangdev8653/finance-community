import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLearningSeriesDto {
  @IsString() @MaxLength(300) title!: string;
  @IsString() @MaxLength(320) slug!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(1) estimatedDurationMinutes?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) @MaxLength(250, { each: true }) learningOutcomes?: string[];
  @IsOptional() @IsUUID() heroMediaId?: string;
  @IsOptional() @IsString() @MaxLength(250) heroAltText?: string;
  @IsOptional() @IsUUID() outcomesMediaId?: string;
  @IsOptional() @IsString() @MaxLength(250) outcomesAltText?: string;
  @IsOptional() @IsUUID() ctaMediaId?: string;
  @IsOptional() @IsString() @MaxLength(250) ctaAltText?: string;
  @IsUUID() domainId!: string;
  @IsUUID() categoryId!: string;
}

export class AddSeriesLessonDto {
  @IsUUID() postId!: string;
  @IsInt() @Min(1) lessonOrder!: number;
  @IsOptional() isRequired?: boolean;
}

export class UpdateLearningSeriesDto {
  @IsOptional() @IsString() @MaxLength(300) title?: string;
  @IsOptional() @IsString() @MaxLength(320) slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(1) estimatedDurationMinutes?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) @MaxLength(250, { each: true }) learningOutcomes?: string[];
  @IsOptional() @IsUUID() heroMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(250) heroAltText?: string | null;
  @IsOptional() @IsUUID() outcomesMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(250) outcomesAltText?: string | null;
  @IsOptional() @IsUUID() ctaMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(250) ctaAltText?: string | null;
  @IsOptional() @IsUUID() domainId?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateSeriesLessonOrderDto {
  @IsInt() @Min(1) lessonOrder!: number;
}

export class UpdateSeriesLessonDto {
  @IsBoolean() isRequired!: boolean;
}
