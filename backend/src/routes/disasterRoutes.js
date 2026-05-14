const express = require("express");
const rateLimit = require("express-rate-limit");
const { auth } = require("../middleware/auth");
const { roleGuard } = require("../middleware/role");
const {
  listDisasters,
  getDisasterGuidance,
  getDisasterQuiz,
  getRandomQuizPool,
  submitRandomQuizPool,
  getQuizSecuritySummary,
} = require("../controllers/disasterController");

const router = express.Router();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const quizSubmitLimiter = rateLimit({
  windowMs: toInt(process.env.QUIZ_SUBMIT_RATE_WINDOW_MS, 60 * 1000),
  max: toInt(process.env.QUIZ_SUBMIT_RATE_MAX, 8),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many quiz submissions. Please wait and try again." },
  keyGenerator: (req) => `quiz-submit:${req.user?.id || req.ip}`,
});

router.get("/", auth, listDisasters);
router.get("/quiz-pool", auth, getRandomQuizPool);
router.post("/quiz-pool/submit", auth, quizSubmitLimiter, submitRandomQuizPool);
router.get(
  "/quiz-pool/security-summary",
  auth,
  roleGuard(["Administrator", "DisasterOfficer"]),
  getQuizSecuritySummary
);
router.get("/:key/guidance", auth, getDisasterGuidance);
router.get("/:key/quiz", auth, getDisasterQuiz);

module.exports = router;
