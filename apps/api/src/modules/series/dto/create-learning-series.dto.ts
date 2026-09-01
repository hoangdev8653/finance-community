import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLearningSeriesDto {
  @IsString() @MaxLength(300) title!: string;
  @IsString() @MaxLength(320) slug!: string;
  @IsOptional() @IsString() description?: string;
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
