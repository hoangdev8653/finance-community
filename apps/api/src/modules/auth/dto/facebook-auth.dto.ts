import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacebookAuthDto {
  @ApiProperty({
    description: 'Facebook User Access Token received from Facebook JavaScript SDK Login',
    example: 'EAABwzLixnjYBA...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}
