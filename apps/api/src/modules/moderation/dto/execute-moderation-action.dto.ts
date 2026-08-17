import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExecuteModerationActionDto {
  @ApiPropertyOptional({ description: 'Report ID if resolving an existing queue report', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  reportId?: string;

  @ApiPropertyOptional({ description: 'Direct target post ID if reportId omitted', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  targetPostId?: string;

  @ApiPropertyOptional({ description: 'Direct target comment ID if reportId omitted', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  targetCommentId?: string;

  @ApiPropertyOptional({ description: 'Direct target user ID if reportId omitted', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @ApiProperty({
    description: 'Moderation action type (HIDE_CONTENT is forbidden on USER targets)',
    enum: ['WARN', 'HIDE_CONTENT', 'SUSPEND', 'BAN', 'DISMISS'],
    example: 'HIDE_CONTENT',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['WARN', 'HIDE_CONTENT', 'SUSPEND', 'BAN', 'DISMISS'])
  actionType!: string;

  @ApiProperty({ description: 'Reason for enforcement action', example: 'Contains prohibited financial misinformation' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ description: 'Optional action metadata object' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
