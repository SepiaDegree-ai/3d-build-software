const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const projectRoutes = require('./routes/projectRoute');
const speckleRoutes = require('./routes/speckleRoute');
const materialRoutes = require('./routes/materialRoute');
const { errorHandler } = require('./middleware/errorHandler');
const cleanupOldModels = require('./scripts/cleanupModels');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'models');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/speckle', speckleRoutes);
app.use('/api/materials', materialRoutes);

// Error handling middleware should be last
app.use(errorHandler);

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Connect to MongoDB
connectDB();

// Run cleanup on startup
cleanupOldModels().catch(err => {
  console.error('Error during model cleanup:', err);
});

// Schedule cleanup to run daily
setInterval(() => {
  cleanupOldModels().catch(err => {
    console.error('Error during scheduled model cleanup:', err);
  });
}, 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 