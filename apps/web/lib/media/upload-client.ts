import {
  UploadSignatureResponse,
  CloudinaryUploadResponse,
} from '../../types/media';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_COMPRESSED_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export async function sha256File(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function compressImage(file: File, maxDimension = 2400, quality = 0.82): Promise<File> {
  if (file.type === 'image/gif' || file.type === 'image/webp' && file.size <= MAX_COMPRESSED_FILE_SIZE_BYTES) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob) throw new Error('Không thể nén ảnh trên trình duyệt.');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp', lastModified: Date.now() });
}

export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type is not supported. Please upload JPEG, PNG, WebP, or GIF.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File exceeds the 10MB limit.',
    };
  }

  return { valid: true };
}

export const uploadClient = {
  /**
   * Upload binary file directly from browser to Cloudinary CDN using signed parameters.
   */
  async uploadToCloudinary(
    file: File,
    signatureData: UploadSignatureResponse,
    onProgress?: (percent: number) => void
  ): Promise<CloudinaryUploadResponse> {
    const validation = validateMediaFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    if (!cloudName || !apiKey) {
      throw new Error('Thiếu cấu hình Cloudinary ở frontend. Hãy kiểm tra NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_API_KEY.');
    }
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(signatureData.timestamp));
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);

    return new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
            if (onProgress) onProgress(100);
            resolve(json);
          } catch {
            reject(new Error('Invalid JSON response from Cloudinary.'));
          }
        } else {
          try {
            const errorJson = JSON.parse(xhr.responseText);
            reject(
              new Error(
                errorJson?.error?.message || `Upload failed with HTTP ${xhr.status}`
              )
            );
          } catch {
            reject(new Error(`Upload failed with HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred during Cloudinary upload.'));
      };

      xhr.send(formData);
    });
  },
};
