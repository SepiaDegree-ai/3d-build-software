const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadModel } = require('../controllers/uploadController');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `model-${uniqueSuffix}${ext}`);
  }
});

// File filter for .glb and .gltf
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.glb', '.gltf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .glb and .gltf files are allowed.'));
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1 // Only allow 1 file per request
  }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 100MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  console.error('Upload route error:', err);
  return res.status(500).json({
    success: false,
    error: 'Internal server error during upload'
  });
};

// Upload route
router.post('/upload-model', 
  upload.single('model'),
  handleUploadError,
  uploadModel
);

module.exports = router; 