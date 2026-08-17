import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ToggleFeatureFlagDto {
  @IsBoolean()
  @IsNotEmpty()
  isEnabled!: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
