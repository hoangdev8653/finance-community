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

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'finance-community';
    const apiKey =
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 'dev_api_key';
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
