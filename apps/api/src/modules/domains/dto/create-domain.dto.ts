import { IsString, IsNotEmpty, MaxLength, Matches, IsOptional, IsInt, Min, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({ example: 'Tài chính', description: 'Display name of the domain' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'MONEY', description: 'Generated from the domain name when omitted' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Mã code phải viết hoa, chỉ gồm chữ cái, số và dấu gạch dưới (VD: MONEY, REAL_ESTATE)',
  })
  code?: string;

  @ApiPropertyOptional({ example: 'tai-chinh', description: 'Unique URL slug in kebab-case (tự động tạo từ tên nếu bỏ trống)' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug phải ở định dạng kebab-case (VD: tai-chinh, bat-dong-san)',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/domains/finance.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  @Matches(/^https:\/\/.+/i, { message: 'Image URL must use HTTPS.' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Chuyên đề kiến thức tài chính, đầu tư chứng khoán và kinh tế vĩ mô' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPromoted?: boolean;
}
