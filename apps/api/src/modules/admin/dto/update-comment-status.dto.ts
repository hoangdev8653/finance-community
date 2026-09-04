import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateCommentStatusDto {
  @IsIn(['VISIBLE', 'HIDDEN'])
  status: 'VISIBLE' | 'HIDDEN';

  @IsOptional()
  @IsString()
  reason?: string;
}
