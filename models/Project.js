const mongoose = require('mongoose');

const selectionSchema = new mongoose.Schema({
  objectId: {
    type: String,
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  }
});

const projectSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  modelUrl: {
    type: String,
    required: true
  },
  selections: [selectionSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema); 