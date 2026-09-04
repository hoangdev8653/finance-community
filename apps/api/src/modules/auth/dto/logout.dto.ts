import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LogoutDto {
  @ApiPropertyOptional({ description: 'Current refresh token to revoke specifically' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
