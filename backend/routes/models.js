const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { SpeckleLoader } = require('@speckle/objectloader');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept only Revit files
    if (file.mimetype === 'application/octet-stream' && 
        (file.originalname.endsWith('.rvt') || file.originalname.endsWith('.rfa'))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Revit files (.rvt, .rfa) are allowed.'));
    }
  }
});

// Initialize Speckle client
const speckleClient = new SpeckleLoader({
  token: process.env.SPECKLE_TOKEN,
  serverUrl: process.env.SPECKLE_SERVER_URL
});

// Upload and convert model
router.post('/upload', upload.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create a new Speckle stream
    const stream = await speckleClient.createStream({
      name: `Model-${Date.now()}`,
      description: 'Converted Revit model'
    });

    // Convert the model to GLB format
    const convertedModel = await speckleClient.convertToGLB(req.file.path);

    // Upload the converted model to Speckle
    const objectId = await speckleClient.uploadObject(convertedModel, stream.id);

    // Get the download URL
    const modelUrl = await speckleClient.getDownloadUrl(stream.id, objectId);

    // Clean up the uploaded file
    await fs.unlink(req.file.path);

    res.json({
      message: 'Model uploaded and converted successfully',
      modelUrl,
      streamId: stream.id,
      objectId
    });
  } catch (error) {
    console.error('Error processing model:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    res.status(500).json({ 
      message: 'Error processing model',
      error: error.message 
    });
  }
});

// Get model by ID
router.get('/:id', async (req, res) => {
  try {
    const model = await speckleClient.getObject(req.params.id);
    res.json(model);
  } catch (error) {
    res.status(404).json({ message: 'Model not found' });
  }
});

module.exports = router; 