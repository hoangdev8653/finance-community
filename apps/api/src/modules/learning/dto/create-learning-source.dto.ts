import { IsBoolean, IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateLearningSourceDto {
  @IsString() @MaxLength(300) title!: string;
  @IsUrl({ require_protocol: true }) @MaxLength(1000) url!: string;
  @IsOptional() @IsString() @MaxLength(200) publisher?: string;
  @IsOptional() @IsIn(['PRIMARY', 'PROFESSIONAL', 'REFERENCE', 'OFFICIAL']) sourceType?: string;
  @IsOptional() @IsBoolean() isPublic?: boolean;
  @IsOptional() @IsString() notes?: string;
}
