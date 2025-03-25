const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  handleErrors
} = require('../controllers/materialController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads/textures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for texture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `texture-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for textures
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and WebP files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.route('/')
  .post(upload.single('texture'), createMaterial)
  .get(getAllMaterials);

router.route('/:id')
  .get(getMaterialById)
  .put(upload.single('texture'), updateMaterial)
  .delete(deleteMaterial);

// Error handling middleware
router.use(handleErrors);

module.exports = router; 