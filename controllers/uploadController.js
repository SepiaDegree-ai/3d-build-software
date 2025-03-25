const path = require('path');

const uploadModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Generate the file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing file upload'
    });
  }
};

module.exports = {
  uploadModel
}; 