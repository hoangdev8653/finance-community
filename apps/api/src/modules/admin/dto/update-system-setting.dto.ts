import { IsObject, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSystemSettingDto {
  @IsObject()
  @IsNotEmpty()
  value!: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;
}
