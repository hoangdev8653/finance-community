export interface UploadSignatureResponse {
  timestamp: number;
  signature: string;
  folder: string;
}

export interface RegisterMediaDto {
  cloudinaryPublicId: string;
  secureUrl: string;
  resourceType?: 'image' | 'video' | 'raw';
  format?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  purpose?: 'avatar' | 'cover' | 'content';
  contentHash?: string;
}

export interface MediaItem {
  id: string;
  uploaderId: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  purpose: 'avatar' | 'cover' | 'content';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  contentHash: string | null;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}
