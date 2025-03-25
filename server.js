const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const materialRoutes = require('./routes/materialRoute');
const projectRoutes = require('./routes/projectRoute');
const speckleRoutes = require('./routes/speckleRoute');
const cleanupOldModels = require('./scripts/cleanupModels');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/3d-build-software';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/materials', materialRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', speckleRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploads/models', express.static(path.join(__dirname, 'public/uploads/models')));

// Run cleanup on startup
cleanupOldModels().catch(err => {
  console.error('Initial cleanup failed:', err);
});

// Schedule cleanup to run daily
setInterval(() => {
  cleanupOldModels().catch(err => {
    console.error('Scheduled cleanup failed:', err);
  });
}, 24 * 60 * 60 * 1000); // Run every 24 hours

// Global error handling
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 