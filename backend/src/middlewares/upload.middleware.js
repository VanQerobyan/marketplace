const multer = require('multer');
const path = require('path');
const { randomUUID } = require('crypto');
const { mkdir } = require('fs');
const { open, unlink } = require('fs/promises');
const ApiError = require('../utils/ApiError');

const avatarsDirectory = path.resolve(__dirname, '../../uploads/avatars');
const imageTypes = {
  'image/jpeg': { extension: '.jpg', acceptedExtensions: ['.jpg', '.jpeg'] },
  'image/png': { extension: '.png', acceptedExtensions: ['.png'] },
  'image/webp': { extension: '.webp', acceptedExtensions: ['.webp'] }
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    mkdir(avatarsDirectory, { recursive: true }, (error) => callback(error, avatarsDirectory));
  },
  filename: (req, file, callback) => {
    callback(null, `${randomUUID()}${imageTypes[file.mimetype].extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 2 },
  fileFilter: (req, file, callback) => {
    const type = imageTypes[file.mimetype];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!type || !type.acceptedExtensions.includes(extension)) {
      return callback(new ApiError(400, 'Only JPEG, PNG and WebP images are allowed'));
    }

    callback(null, true);
  }
}).single('avatar');

const hasImageSignature = async (file) => {
  const handle = await open(file.path, 'r');
  try {
    const header = Buffer.alloc(12);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    if (file.mimetype === 'image/jpeg') {
      return bytesRead >= 3 && header.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    }
    if (file.mimetype === 'image/png') {
      return bytesRead >= 8 && header.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
    }
    return bytesRead >= 12 && header.toString('ascii', 0, 4) === 'RIFF'
      && header.toString('ascii', 8, 12) === 'WEBP';
  } finally {
    await handle.close();
  }
};

const uploadAvatar = (req, res, next) => {
  upload(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE';
      return next(new ApiError(tooLarge ? 413 : 400,
        tooLarge ? 'Avatar must be at most 5 MB' : 'Upload one image using the avatar field'));
    }
    if (error) return next(error);
    if (!req.file) return next(new ApiError(400, 'Avatar image is required'));

    try {
      if (!await hasImageSignature(req.file)) {
        throw new ApiError(400, 'File contents do not match the image type');
      }
      next();
    } catch (validationError) {
      await unlink(req.file.path).catch(() => {});
      next(validationError);
    }
  });
};

module.exports = { uploadAvatar, avatarsDirectory, imageTypes, hasImageSignature };
