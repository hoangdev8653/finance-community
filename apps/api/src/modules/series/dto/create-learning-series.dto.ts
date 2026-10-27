import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLearningSeriesDto {
  @IsString() @MaxLength(300) title!: string;
  @IsOptional() @IsString() @MaxLength(320) slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) @MaxLength(250, { each: true }) learningOutcomes?: string[];
  @IsOptional() @IsUUID() heroMediaId?: string;
  @IsOptional() @IsString() @MaxLength(250) heroAltText?: string;
  @IsUUID() domainId!: string;
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
  @IsOptional() @IsArray() @IsString({ each: true }) @MaxLength(250, { each: true }) learningOutcomes?: string[];
  @IsOptional() @IsUUID() heroMediaId?: string | null;
  @IsOptional() @IsString() @MaxLength(250) heroAltText?: string | null;
  @IsOptional() @IsUUID() domainId?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateSeriesLessonOrderDto {
  @IsInt() @Min(1) lessonOrder!: number;
}

export class UpdateSeriesLessonDto {
  @IsBoolean() isRequired!: boolean;
}
