import { IsString, IsNotEmpty, IsUrl, IsOptional, IsInt, Min, IsIn } from 'class-validator';

export class RegisterMediaDto {
  @IsString()
  @IsNotEmpty()
  cloudinaryPublicId!: string;

  @IsUrl({ require_protocol: true })
  @IsNotEmpty()
  secureUrl!: string;

  @IsString()
  @IsIn(['image', 'video', 'raw'])
  resourceType!: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  fileSize?: number;

  @IsOptional()
  @IsString()
  @IsIn(['avatar', 'cover', 'content'])
  purpose?: string;
}
