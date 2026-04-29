const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    institutionId: { type: String, trim: true, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    type: {
      type: String,
      enum: ["Central", "State", "Deemed", "Private"],
      default: "State",
    },
    address: { type: String, trim: true },
    website: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    accreditation: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Active", "Dormant", "De-recognized"],
      default: "Active",
    },
    disasterMetadata: {
      earthquakeZone: {
        type: String,
        enum: ["II", "III", "IV", "V"],
      },
      floodRisk: {
        type: String,
        enum: ["Low", "Medium", "High"],
      },
      cycloneRisk: {
        type: String,
        enum: ["Low", "Medium", "High"],
      },
    },
    infrastructureScore: { type: Number, min: 0, max: 100, default: 0 },
    trainingHours: { type: Number, min: 0, default: 0 },
    awarenessScore: { type: Number, min: 0, max: 100, default: 0 },
    incidentHistory: { type: Number, min: 0, default: 0 },
    drillFrequency: { type: Number, min: 0, default: 0 },
    lastAssessmentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institution", institutionSchema);
