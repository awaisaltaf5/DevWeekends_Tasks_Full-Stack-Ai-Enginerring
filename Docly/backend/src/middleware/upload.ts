import multer from 'multer';

/**
 * Multer storage keeps uploads in memory — the buffer is passed straight to
 * the Cloudinary service. The file is never written to disk.
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = file.mimetype.split('/')[1];
        if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG/JPG/PNG/WEBP images are allowed.'));
    }
  },
});

export default upload;
