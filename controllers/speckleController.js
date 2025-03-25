const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const catchAsync = require('../utils/catchAsync');

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '../public/uploads/models');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
};

exports.importFromSpeckle = catchAsync(async (req, res) => {
  const { streamId, objectId } = req.body;

  if (!streamId || !objectId) {
    return res.status(400).json({
      status: 'error',
      message: 'Stream ID and Object ID are required'
    });
  }

  try {
    // Ensure uploads directory exists
    await ensureUploadsDir();

    // Fetch object data from Speckle
    const speckleResponse = await axios.get(
      `${process.env.SPECKLE_SERVER}/api/v1/streams/${streamId}/objects/${objectId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SPECKLE_TOKEN}`
        }
      }
    );

    const objectData = speckleResponse.data;

    // Check if GLB URL is available
    if (!objectData.viewerUrl || !objectData.viewerUrl.includes('.glb')) {
      return res.status(400).json({
        status: 'error',
        message: 'No GLB export available for this object'
      });
    }

    // Download the GLB file
    const glbResponse = await axios.get(objectData.viewerUrl, {
      responseType: 'arraybuffer'
    });

    // Generate filename
    const filename = `${streamId}-${objectId}.glb`;
    const filepath = path.join(__dirname, '../public/uploads/models', filename);

    // Save the file
    await fs.writeFile(filepath, glbResponse.data);

    // Return success response with file URL
    res.status(200).json({
      status: 'success',
      data: {
        fileUrl: `/uploads/models/${filename}`
      }
    });

  } catch (error) {
    console.error('Speckle import error:', error);
    
    if (error.response) {
      // Handle Speckle API errors
      return res.status(error.response.status).json({
        status: 'error',
        message: error.response.data.message || 'Failed to import from Speckle'
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: 'error',
      message: 'Failed to import model from Speckle'
    });
  }
}); 