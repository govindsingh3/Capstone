const mongoose = require("mongoose");

const drillSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    type: {
      type: String,
      enum: ["Fire", "Earthquake", "Evacuation"],
      required: true,
    },
    participationRate: { type: Number, min: 0, max: 100, required: true },
    responseTime: { type: Number, min: 1, max: 300, required: true },
    coordinationScore: { type: Number, min: 0, max: 100, required: true },
    performanceScore: { type: Number, min: 0, max: 100 },
    conductedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drill", drillSchema);
