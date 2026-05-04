const mongoose = require('mongoose');

const MetalRateSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    goldPerGram: { type: Number, required: true, default: 0 },
    silverPerGram: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MetalRateSettings', MetalRateSettingsSchema);
