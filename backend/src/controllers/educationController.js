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
  const hasContentId = Boolean(req.body.contentId);
  const hasContentKey = Boolean(req.body.contentKey);

  if (!hasContentId && !hasContentKey) {
    return res.status(400).json({ error: "contentId or contentKey is required" });
  }

  const result = await QuizResult.create({
    studentId: req.user.id,
    ...req.body,
  });
  res.status(201).json(result);
});

const listMyQuizResults = asyncHandler(async (req, res) => {
  const items = await QuizResult.find({ studentId: req.user.id })
    .sort({ completedAt: -1, createdAt: -1 })
    .limit(20)
    .lean();

  const scores = items.map((item) => item.score);
  const attempts = items.length;
  const latestScore = attempts ? scores[0] : null;
  const bestScore = attempts ? Math.max(...scores) : null;

  res.json({
    items,
    summary: {
      attempts,
      latestScore,
      bestScore,
    },
  });
});

const getRevisionPlan = asyncHandler(async (req, res) => {
  const contentKey = req.query.contentKey || "learning-center-self-check";
  const recent = await QuizResult.find({ studentId: req.user.id, contentKey })
    .sort({ completedAt: -1, createdAt: -1 })
    .limit(12)
    .lean();

  const areaCounts = new Map();
  for (const item of recent) {
    const areas = Array.isArray(item.weakAreas) ? item.weakAreas : [];
    for (const area of areas) {
      if (!area || typeof area !== "string") continue;
      areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
    }
  }

  const topAreas = [...areaCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area, misses]) => ({ area, misses }));

  const latest = recent[0] || null;
  const baseAreas =
    topAreas.length > 0
      ? topAreas
      : [
          {
            area: (latest?.score || 0) < 70 ? "Emergency Communication" : "Scenario Decision Timing",
            misses: 1,
          },
        ];

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const schedule = baseAreas.map((item) => ({
    area: item.area,
    misses: item.misses,
    reviews: [
      { label: "Day 1", reviewAt: new Date(now + dayMs).toISOString() },
      { label: "Day 3", reviewAt: new Date(now + 3 * dayMs).toISOString() },
      { label: "Day 7", reviewAt: new Date(now + 7 * dayMs).toISOString() },
    ],
  }));

  res.json({
    contentKey,
    generatedAt: new Date(now).toISOString(),
    schedule,
  });
});

const getQuizLeaderboard = asyncHandler(async (req, res) => {
  const days = Number.parseInt(req.query.days, 10);
  const lookbackDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 90) : 30;
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  const contentKey = req.query.contentKey || "learning-center-self-check";

  const rows = await QuizResult.aggregate([
    {
      $match: {
        contentKey,
        completedAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: "$studentId",
        avgScore: { $avg: "$score" },
        bestScore: { $max: "$score" },
        attempts: { $sum: 1 },
      },
    },
    { $sort: { avgScore: -1, bestScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        name: {
          $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, "Learner"],
        },
        avgScore: { $round: ["$avgScore", 0] },
        bestScore: 1,
        attempts: 1,
      },
    },
  ]);

  res.json({
    windowDays: lookbackDays,
    contentKey,
    leaderboard: rows,
  });
});

module.exports = {
  createContent,
  listContent,
  submitQuiz,
  listMyQuizResults,
  getQuizLeaderboard,
  getRevisionPlan,
};
