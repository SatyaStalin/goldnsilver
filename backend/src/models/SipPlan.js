const mongoose = require('mongoose');

const SipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    metal: { type: String, enum: ['gold', 'silver', 'gold+silver'], required: true },
    type: {
      type: String,
      enum: ['digital_gold_sip', 'mutual_fund_sip', 'gold_accumulation', 'goal_based'],
      required: true
    },
    goal: { type: String }, // e.g. Marriage, Education
    minInstallment: { type: Number, required: true },
    frequency: { type: String, enum: ['monthly', 'weekly'], default: 'monthly' },
    tenureMonths: { type: Number },
    description: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SipPlan', SipPlanSchema);

