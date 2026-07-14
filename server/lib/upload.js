import multer from 'multer';

// Shared image-upload middleware. Factored out of routes/photo.js so photo
// logging and the verdict endpoints use one identical config — in-memory
// buffer (we base64 it straight into the Claude vision call), a 12MB cap, and
// a permissive image-only mime filter. A non-image upload is rejected before it
// ever reaches an inference call.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || file.mimetype.startsWith('image/')) return cb(null, true);
    cb(null, false); // silently drop → route sees no req.file and returns "image is required"
  },
});
