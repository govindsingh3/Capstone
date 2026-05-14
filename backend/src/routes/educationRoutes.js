const express = require("express");
const { auth } = require("../middleware/auth");
const { roleGuard } = require("../middleware/role");
const { validate } = require("../middleware/validate");
const { contentSchema, quizResultSchema } = require("../validators/educationSchemas");
const {
  createContent,
  listContent,
  submitQuiz,
  listMyQuizResults,
  getQuizLeaderboard,
  getRevisionPlan,
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
  roleGuard(["Student", "Teacher", "Administrator", "DisasterOfficer"]),
  validate(quizResultSchema),
  submitQuiz
);
router.get(
  "/quiz-results",
  auth,
  roleGuard(["Student", "Teacher", "Administrator", "DisasterOfficer"]),
  listMyQuizResults
);
router.get(
  "/quiz-results/leaderboard",
  auth,
  roleGuard(["Student", "Teacher", "Administrator", "DisasterOfficer"]),
  getQuizLeaderboard
);
router.get(
  "/quiz-results/revision-plan",
  auth,
  roleGuard(["Student", "Teacher", "Administrator", "DisasterOfficer"]),
  getRevisionPlan
);

module.exports = router;
