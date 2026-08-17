import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google OAuth ID Token or Credential received from Google Sign-In SDK on Frontend',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhMmIzYyJ9...',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
