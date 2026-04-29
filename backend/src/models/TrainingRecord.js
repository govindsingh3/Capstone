const mongoose = require("mongoose");

const trainingRecordSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    topic: { type: String, required: true, trim: true },
    hours: { type: Number, min: 0, required: true },
    attendees: { type: Number, min: 0, default: 0 },
    conductedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingRecord", trainingRecordSchema);
