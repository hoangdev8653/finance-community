import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

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
