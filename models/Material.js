const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true,
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  textureUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    enum: ['wood', 'metal', 'glass', 'plastic', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    default: 'USD/m²',
    trim: true
  },
  color: {
    type: String,
    default: '#cccccc',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please use a valid hex color']
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster queries
materialSchema.index({ category: 1, name: 1 });

// Pre-save hook to ensure textureUrl has the correct path
materialSchema.pre('save', function(next) {
  if (this.textureUrl && !this.textureUrl.startsWith('/')) {
    this.textureUrl = `/uploads/textures/${this.textureUrl}`;
  }
  next();
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material; 