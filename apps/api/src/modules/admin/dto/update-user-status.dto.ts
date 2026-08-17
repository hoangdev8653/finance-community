import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Target account status transition state',
    enum: ['ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED'],
    example: 'SUSPENDED',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED'])
  status!: string;

  @ApiProperty({ description: 'Reason for status update', example: 'Repeated terms of service violations' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
