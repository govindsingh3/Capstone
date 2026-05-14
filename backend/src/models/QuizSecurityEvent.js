const mongoose = require("mongoose");

const quizSecurityEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String, trim: true },
    action: { type: String, default: "quiz_pool_submit", trim: true },
    outcome: {
      type: String,
      enum: ["success", "replay_blocked", "rejected", "invalid"],
      required: true,
    },
    reason: { type: String, trim: true },
    score: { type: Number, min: 0, max: 100 },
    total: { type: Number, min: 0 },
    correct: { type: Number, min: 0 },
    ipHash: { type: String, trim: true },
    userAgentHash: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

quizSecurityEventSchema.index({ submittedAt: -1 });
quizSecurityEventSchema.index({ userId: 1, submittedAt: -1 });
quizSecurityEventSchema.index({ outcome: 1, submittedAt: -1 });

module.exports = mongoose.model("QuizSecurityEvent", quizSecurityEventSchema);
