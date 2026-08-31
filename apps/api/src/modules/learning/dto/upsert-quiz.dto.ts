import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizQuestionInput {
  @IsString() prompt!: string;
  @IsArray() options!: Array<{ id: string; label: string; isCorrect: boolean }>;
  @IsOptional() @IsString() explanation?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

export class UpsertQuizDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => QuizQuestionInput) questions!: QuizQuestionInput[];
}
