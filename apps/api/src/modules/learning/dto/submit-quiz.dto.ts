import { IsArray, IsString } from 'class-validator';

export class SubmitQuizDto {
  @IsArray() answers!: Array<{ questionId: string; optionId: string }>;
}
