import { IsOptional, IsString } from 'class-validator';

export class CreateUploadSignatureDto {
  @IsOptional()
  @IsString()
  folder?: string;
}
