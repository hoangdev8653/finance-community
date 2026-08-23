import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
