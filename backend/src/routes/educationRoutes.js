const express = require("express");
const { auth } = require("../middleware/auth");
const { roleGuard } = require("../middleware/role");
const { validate } = require("../middleware/validate");
const { contentSchema, quizResultSchema } = require("../validators/educationSchemas");
const {
  createContent,
  listContent,
  submitQuiz,
} = require("../controllers/educationController");

const router = express.Router();

router.get("/content", auth, listContent);
router.post(
  "/content",
  auth,
  roleGuard(["Administrator", "Teacher"]),
  validate(contentSchema),
  createContent
);
router.post(
  "/quiz-results",
  auth,
  roleGuard(["Student"]),
  validate(quizResultSchema),
  submitQuiz
);

module.exports = router;
