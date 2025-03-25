const fs = require('fs').promises;
const path = require('path');

const MODELS_DIR = path.join(__dirname, '../public/uploads/models');
const MAX_AGE_DAYS = 7;

async function cleanupOldModels() {
  try {
    // Get all files in the models directory
    const files = await fs.readdir(MODELS_DIR);
    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    for (const file of files) {
      const filePath = path.join(MODELS_DIR, file);
      const stats = await fs.stat(filePath);

      // Check if file is older than MAX_AGE_DAYS
      if (now - stats.mtime.getTime() > maxAge) {
        try {
          await fs.unlink(filePath);
          console.log(`Deleted old model file: ${file}`);
        } catch (err) {
          console.error(`Failed to delete file ${file}:`, err);
        }
      }
    }

    console.log('Model cleanup completed successfully');
  } catch (err) {
    console.error('Error during model cleanup:', err);
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupOldModels();
}

module.exports = cleanupOldModels; 