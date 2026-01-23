const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true, // Index for fast lookups
  },
  originalUrl: {
    type: String,
    required: true,
  },
  customAlias: {
    type: String,
    default: null,
    sparse: true, // Allows multiple null values but enforces uniqueness for non-null
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: null, // null means no expiration
    index: { expireAfterSeconds: 0 }, // TTL index for automatic deletion
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: String,
    default: null,
    index: true, // Index for user-specific queries
    sparse: true,
  },
  // Analytics data
  analytics: {
    clicks: [{
      timestamp: Date,
      ip: String,
      userAgent: String,
      referer: String,
      browser: String, // Parsed browser name (e.g., "Chrome", "Firefox")
      os: String, // Parsed OS name (e.g., "Windows", "macOS")
      device: String, // Device type: Desktop, Mobile, Tablet
      browserVersion: String, // Optional: Browser version
      osVersion: String, // Optional: OS version
      deviceModel: String, // Optional: Device model (e.g., "iPhone 13 Pro")
      country: String, // Country code (e.g., "US", "IN")
      region: String, // Region/State (e.g., "CA", "TN")
    }],
    lastAccessed: Date,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
urlSchema.index({ shortCode: 1, isActive: 1 });
urlSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Url', urlSchema);
