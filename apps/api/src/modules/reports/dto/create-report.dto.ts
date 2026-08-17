import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiPropertyOptional({ description: 'Target reported post ID (UUID format)', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  reportedPostId?: string;

  @ApiPropertyOptional({ description: 'Target reported comment ID (UUID format)', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  reportedCommentId?: string;

  @ApiPropertyOptional({ description: 'Target reported user ID (UUID format)', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  reportedUserId?: string;

  @ApiProperty({ description: 'Reason for report (max 100 characters)', maxLength: 100, example: 'Spam or misleading content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reason!: string;

  @ApiPropertyOptional({ description: 'Detailed description of policy violation' })
  @IsOptional()
  @IsString()
  description?: string;
}
