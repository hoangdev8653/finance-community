import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ToggleReactionDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  reactionType?: string;
}
