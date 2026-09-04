import { Injectable, NotFoundException, ForbiddenException, ConflictException, Optional, ServiceUnavailableException } from '@nestjs/common';
import { MediaRepository, MediaEntity } from '../../../database/repositories/media.repository';
import { RegisterMediaDto } from '../dto/register-media.dto';
import { AuditLogService } from '../../audit/services/audit-log.service';
import * as crypto from 'crypto';

export interface SignatureResponse {
  timestamp: number;
  signature: string;
  folder: string;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepo: MediaRepository,
    @Optional() private readonly auditLogService?: AuditLogService,
  ) {}

  /**
   * Generates a signed payload for secure direct client uploads to Cloudinary.
   */
  generateUploadSignature(folder = 'uploads'): SignatureResponse {
    const timestamp = Math.floor(Date.now() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) throw new ServiceUnavailableException('Cloudinary chưa được cấu hình trên máy chủ.');
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return {
      timestamp,
      signature,
      folder,
    };
  }

  /**
   * Registers media metadata post-upload.
   */
  async registerMedia(uploaderId: string, dto: RegisterMediaDto, tx?: any): Promise<MediaEntity> {
    if (dto.contentHash) {
      const byHash = await this.mediaRepo.findByContentHash(dto.contentHash);
      if (byHash) return byHash;
    }
    const existing = await this.mediaRepo.findByCloudinaryPublicId(dto.cloudinaryPublicId);
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: 'Media asset with this Cloudinary ID already exists.',
        code: 'MEDIA_ALREADY_EXISTS',
      });
    }

    const record = await this.mediaRepo.createTx(tx, {
      uploaderId,
      cloudinaryPublicId: dto.cloudinaryPublicId,
      secureUrl: dto.secureUrl,
      resourceType: dto.resourceType,
      format: dto.format || null,
      width: dto.width || null,
      height: dto.height || null,
      fileSize: dto.fileSize || null,
      purpose: dto.purpose || 'content',
      contentHash: dto.contentHash || null,
    });

    if (this.auditLogService) {
      await this.auditLogService.log({
        actor_id: uploaderId,
        action: 'MEDIA_UPLOAD',
        entity_type: 'media',
        entity_id: record.id,
        metadata: { purpose: record.purpose, publicId: record.cloudinaryPublicId },
      });
    }

    return record;
  }

  /**
   * Retrieves media asset metadata by ID.
   */
  async getMediaById(id: string): Promise<MediaEntity> {
    const media = await this.mediaRepo.findById(id);
    if (!media) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Media asset with ID '${id}' not found.`,
        code: 'MEDIA_NOT_FOUND',
      });
    }
    return media;
  }

  async getMediaByHash(hash: string): Promise<MediaEntity | null> {
    return (await this.mediaRepo.findByContentHash(hash)) || null;
  }

  async getMediaBySecureUrl(url: string): Promise<MediaEntity | undefined> {
    return this.mediaRepo.findBySecureUrl(url);
  }

  /**
   * Soft-deletes a media asset if requested by uploader or admin.
   */
  async deleteMedia(uploaderId: string, id: string, isAdmin = false): Promise<boolean> {
    const media = await this.getMediaById(id);
    if (media.uploaderId !== uploaderId && !isAdmin) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to delete this media asset.',
        code: 'FORBIDDEN_RESOURCE',
      });
    }

    const deleted = await this.mediaRepo.softDeleteTx(undefined, id);

    if (deleted && this.auditLogService) {
      await this.auditLogService.log({
        actor_id: uploaderId,
        action: 'MEDIA_DELETE',
        entity_type: 'media',
        entity_id: id,
      });
    }

    return deleted;
  }
}
