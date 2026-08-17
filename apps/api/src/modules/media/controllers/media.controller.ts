import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from '../services/media.service';
import { RegisterMediaDto } from '../dto/register-media.dto';
import { CreateUploadSignatureDto } from '../dto/create-upload-signature.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountStatusGuard } from '../../auth/guards/account-status.guard';
import { EmailVerificationGuard } from '../../auth/guards/email-verification.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-signature')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate Cloudinary upload presigned signature' })
  @ApiResponse({ status: 200, description: 'Cloudinary signature and upload parameters' })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer JWT' })
  @ApiResponse({ status: 403, description: 'Email verification required' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)
  generateSignature(
    @CurrentUser() user: any,
    @Body() dto: CreateUploadSignatureDto,
  ) {
    return this.mediaService.generateUploadSignature(dto.folder);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register uploaded media record' })
  @ApiResponse({ status: 201, description: 'Registered MediaEntity' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid Cloudinary URL' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard, EmailVerificationGuard)
  registerMedia(
    @CurrentUser() user: any,
    @Body() dto: RegisterMediaDto,
  ) {
    return this.mediaService.registerMedia(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media details by ID' })
  @ApiResponse({ status: 200, description: 'MediaEntity details' })
  @ApiResponse({ status: 404, description: 'Media item not found or deleted' })
  getMedia(@Param('id') id: string) {
    return this.mediaService.getMediaById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft-delete media record' })
  @ApiResponse({ status: 204, description: 'Media soft-deleted successfully' })
  @ApiResponse({ status: 403, description: 'Ownership authorization failed' })
  @ApiResponse({ status: 404, description: 'Media item not found' })
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async deleteMedia(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    await this.mediaService.deleteMedia(user.sub, id);
  }
}
