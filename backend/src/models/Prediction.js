const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    readinessCategory: { type: String, required: true },
    readinessScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    topRiskFactors: [{ type: String }],
    shapValues: [{ feature: String, value: Number }],
    inputFeatures: {
      drillFrequency: Number,
      infrastructureScore: Number,
      awarenessScore: Number,
      trainingHours: Number,
      incidentHistory: Number,
      participationRate: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
