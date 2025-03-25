const fs = require('fs').promises;
const path = require('path');

const cleanupOldModels = async () => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'models');
    
    // Check if directory exists
    try {
      await fs.access(uploadsDir);
    } catch (error) {
      console.log('Uploads directory does not exist, skipping cleanup');
      return;
    }

    const files = await fs.readdir(uploadsDir);
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > oneWeek) {
        await fs.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error during model cleanup:', error);
    // Don't throw the error, just log it
  }
};

// Run cleanup if called directly
if (require.main === module) {
  cleanupOldModels();
}

module.exports = cleanupOldModels; 