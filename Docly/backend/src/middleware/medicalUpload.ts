import multer from 'multer';

/** Allowed MIME types for medical record uploads. */
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

/** Human-friendly list of allowed extensions for error messages. */
const ALLOWED_EXTENSIONS = 'JPG, JPEG, PNG, WEBP, PDF';

/**
 * Multer config for medical documents (reports, lab results, prescription
 * images, PDFs). Files are kept in memory and handed straight to Cloudinary —
 * never written to disk.
 *
 * Validation:
 *  - MIME type must be in the allow-list (checked via the file's reported type
 *    AND its filename extension).
 *  - Size limited to 10 MB.
 */
const medicalUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const byMime = ALLOWED_MIME.has(file.mimetype.toLowerCase());
    const ext = (file.originalname.split('.').pop() ?? '').toLowerCase();
    const byExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext);

    if (byMime || byExt) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS}.`));
    }
  },
});

export default medicalUpload;

export { ALLOWED_EXTENSIONS };