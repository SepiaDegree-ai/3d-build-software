const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    required: true
  },
  pricePerSquareMeter: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: false
  },
  properties: {
    roughness: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0.5
    },
    metalness: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

materialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Material', materialSchema); 