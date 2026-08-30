import { v2 as cloudinary } from 'cloudinary';

/**
 * Minimal Cloudinary integration for doctor profile image uploads.
 *
 * Credentials are read from environment variables ONLY — never hardcoded:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * When the credentials are not configured, `uploadImage` returns `null` so
 * callers can keep the existing profile image.
 */

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configure(): boolean {
  if (!isCloudinaryConfigured()) {
    return false;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

/** Derive a MIME type from a filename's extension. */
function mimeTypeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    pdf: 'application/pdf',
  };
  return map[ext] ?? 'application/octet-stream';
}

/** Result of a successful Cloudinary upload. */
export interface UploadedFile {
  url: string;
  publicId: string;
}

/**
 * Upload an arbitrary medical document (image or PDF) to Cloudinary.
 *
 * Images use `resource_type: 'image'`; everything else (PDFs) use `'raw'`.
 * Returns null when Cloudinary is not configured or the upload fails.
 */
export async function uploadMedicalFile(
  buffer: Buffer,
  originalName = '',
  publicIdBase = 'docly-records',
): Promise<UploadedFile | null> {
  if (!configure()) {
    return null;
  }
  const mimeType = mimeTypeFromName(originalName);
  const isImage = mimeType.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw';
  const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const safeBase = publicIdBase.replace(/[^a-zA-Z0-9_-]/g, '-');
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'docly/records',
      public_id: safeBase,
      overwrite: true,
      resource_type: resourceType,
      ...(isImage
        ? {
            transformation: {
              width: 1200,
              crop: 'limit',
              quality: 'auto',
              fetch_format: 'auto',
            },
          }
        : {}),
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    return null;
  }
}

/**
 * Upload an image buffer (from a multipart field) to Cloudinary and return the
 * secure URL. Returns null when Cloudinary is not configured or the upload
 * fails, so a graceful fallback can be used.
 */
export async function uploadImage(
  buffer: Buffer,
  originalName = '',
  publicIdBase = 'docly-doctors',
): Promise<string | null> {
  if (!configure()) {
    return null;
  }
  const mimeType = mimeTypeFromName(originalName);
  const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'docly/doctors',
      public_id: publicIdBase,
      overwrite: true,
      transformation: { width: 600, height: 600, crop: 'limit', quality: 'auto' },
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (err) {
    return null;
  }
}