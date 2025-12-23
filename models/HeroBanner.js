const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  image: { type: String, required: true }, // URL string
  ctaPrimaryLabel: { type: String, required: true },
  ctaPrimaryLink: { type: String, required: true },
  ctaSecondaryLabel: { type: String, required: true },
  ctaSecondaryLink: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const HeroBanner = mongoose.model('HeroBanner', heroBannerSchema);
module.exports = HeroBanner;
