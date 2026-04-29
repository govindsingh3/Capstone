const mongoose = require("mongoose");

const learningContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["Video", "Quiz", "Infographic"], required: true },
    url: { type: String, trim: true },
    metadata: { type: Object, default: {} },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LearningContent", learningContentSchema);
