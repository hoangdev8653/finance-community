import { IsUUID, IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'Target user ID (UUID format)', format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    description: 'RBAC role name to assign or revoke (Only SUPER_ADMIN can assign SUPER_ADMIN role)',
    enum: ['MEMBER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    example: 'MODERATOR',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['MEMBER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'])
  roleName!: string;
}
