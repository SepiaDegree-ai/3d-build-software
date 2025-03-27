require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

// Import routes
const materialsRouter = require('./routes/materials');
const projectsRouter = require('./routes/projects');
const modelsRouter = require('./routes/models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
})();

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/materials', materialsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/models', modelsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 