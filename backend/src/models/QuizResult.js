const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningContent",
      required: true,
    },
    score: { type: Number, min: 0, max: 100, required: true },
    attempts: { type: Number, min: 1, default: 1 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
