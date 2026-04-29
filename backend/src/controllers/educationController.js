const LearningContent = require("../models/LearningContent");
const QuizResult = require("../models/QuizResult");
const { asyncHandler } = require("../utils/asyncHandler");

const createContent = asyncHandler(async (req, res) => {
  const content = await LearningContent.create({
    ...req.body,
    uploadedBy: req.user.id,
  });
  res.status(201).json(content);
});

const listContent = asyncHandler(async (req, res) => {
  const items = await LearningContent.find().sort({ createdAt: -1 });
  res.json(items);
});

const submitQuiz = asyncHandler(async (req, res) => {
  const result = await QuizResult.create({
    studentId: req.user.id,
    ...req.body,
  });
  res.status(201).json(result);
});

module.exports = { createContent, listContent, submitQuiz };
