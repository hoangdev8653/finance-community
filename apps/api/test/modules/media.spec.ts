import { MediaService } from '../../src/modules/media/services/media.service';
import { MediaRepository } from '../../src/database/repositories/media.repository';

describe('MediaService', () => {
  let mediaService: MediaService;
  let mockMediaRepo: jest.Mocked<MediaRepository>;

  beforeEach(() => {
    mockMediaRepo = {
      createTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: 'media-uuid-1',
        uploaderId: data.uploaderId,
        cloudinaryPublicId: data.cloudinaryPublicId,
        secureUrl: data.secureUrl,
        resourceType: data.resourceType,
        format: data.format || null,
        width: data.width || null,
        height: data.height || null,
        fileSize: data.fileSize || null,
        purpose: data.purpose || 'content',
        createdAt: new Date(),
        deletedAt: null,
      })),
      findById: jest.fn(),
      findByCloudinaryPublicId: jest.fn(),
      softDeleteTx: jest.fn().mockResolvedValue(true),
    } as any;

    mediaService = new MediaService(mockMediaRepo);
  });

  it('should generate secure upload signature containing timestamp and folder', () => {
    const res = mediaService.generateUploadSignature('avatars');
    expect(res).toBeDefined();
    expect(res.folder).toBe('avatars');
    expect(res.timestamp).toBeGreaterThan(0);
    expect(res.signature).toBeDefined();
  });

  it('should register uploaded media metadata successfully', async () => {
    mockMediaRepo.findByCloudinaryPublicId.mockResolvedValue(undefined);

    const result = await mediaService.registerMedia('user-123', {
      cloudinaryPublicId: 'public_id_123',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      resourceType: 'image',
      purpose: 'avatar',
    });

    expect(result.id).toBe('media-uuid-1');
    expect(result.uploaderId).toBe('user-123');
    expect(mockMediaRepo.createTx).toHaveBeenCalledTimes(1);
  });

  it('should prevent deleting media owned by another user for non-admins', async () => {
    mockMediaRepo.findById.mockResolvedValue({
      id: 'media-uuid-1',
      uploaderId: 'user-owner',
      cloudinaryPublicId: 'pub1',
      secureUrl: 'https://url.com',
      resourceType: 'image',
      format: 'jpg',
      width: 100,
      height: 100,
      fileSize: 500,
      purpose: 'avatar',
      createdAt: new Date(),
      deletedAt: null,
    });

    await expect(mediaService.deleteMedia('other-user', 'media-uuid-1', false)).rejects.toThrow();
  });
});
