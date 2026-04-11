const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configuration
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024; // 5MB

const cloudinaryConfigured =
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);

if (cloudinaryConfigured && !process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// Ensure uploads directory exists (local fallback)
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

const uploadImage = async (file) => {
  try {
    if (cloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: process.env.CLOUDINARY_FOLDER || 'rks-events'
      });
      try {
        fs.unlinkSync(file.path);
      } catch (_) {
        /* ignore */
      }
      return {
        success: true,
        imageUrl: result.secure_url,
        filename: result.public_id
      };
    }

    const imageUrl = `/uploads/${file.filename}`;
    return {
      success: true,
      imageUrl,
      filename: file.filename
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message || 'Image upload failed'
    };
  }
};

const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || String(imageUrl).startsWith('http')) {
      return { success: true };
    }
    const filename = String(imageUrl).split('/').pop();
    const filePath = path.join(UPLOAD_PATH, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }

    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('Image deletion error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  upload,
  uploadImage,
  deleteImage,
  UPLOAD_PATH
};
