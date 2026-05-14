const { asyncHandler } = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { disasterCatalog } = require("../data/disasterCatalog");
const { getCache, setCache } = require("../utils/simpleCache");
const QuizSecurityEvent = require("../models/QuizSecurityEvent");

const shuffle = (list) => {
  const items = [...list];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

const hashValue = (raw) => {
  const salt = process.env.QUIZ_AUDIT_SALT || "quiz-audit";
  return crypto.createHash("sha256").update(`${salt}:${raw || "unknown"}`).digest("hex").slice(0, 24);
};

const resolveClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const logQuizSecurityEvent = async ({
  req,
  sessionId,
  outcome,
  reason,
  score,
  total,
  correct,
}) => {
  try {
    const submittedAt = new Date();
    await QuizSecurityEvent.create({
      userId: req.user?.id || undefined,
      sessionId,
      action: "quiz_pool_submit",
      outcome,
      reason,
      score,
      total,
      correct,
      ipHash: hashValue(resolveClientIp(req)),
      userAgentHash: hashValue(req.headers["user-agent"] || "unknown"),
      submittedAt,
    });
  } catch (error) {
    // Don't break user flow if audit persistence is unavailable.
    console.error("[quiz-audit] failed to persist event", error.message);
  }
};

const getQuizSessionSecret = () => process.env.QUIZ_SESSION_SECRET || process.env.JWT_SECRET;

const getQuizAnswerKey = () =>
  new Map(
    disasterCatalog.flatMap((item) =>
      item.quiz.map((q, index) => [`${item.key}-${index + 1}`, q.answerIndex])
    )
  );

const getQuizQuestionMap = () =>
  new Map(
    disasterCatalog.flatMap((item) =>
      item.quiz.map((q, index) => [
        `${item.key}-${index + 1}`,
        {
          moduleKey: item.key,
          moduleTitle: item.title,
          difficulty: q.difficulty || "medium",
          weakArea: q.weakArea || "Decision Making",
          explanation: q.explanation || "Review the guidance section for this module.",
          tip: q.tip || "Retry this question in your next session.",
          answerIndex: q.answerIndex,
        },
      ])
    )
  );

const listDisasters = asyncHandler(async (req, res) => {
  const items = disasterCatalog.map((item) => ({
    key: item.key,
    title: item.title,
    category: item.category,
    level: item.level,
    mediaType: item.mediaType,
    durationMins: item.durationMins,
  }));
  res.json(items);
});

const getDisasterGuidance = asyncHandler(async (req, res) => {
  const item = disasterCatalog.find((row) => row.key === req.params.key);
  if (!item) return res.status(404).json({ error: "Disaster module not found" });

  res.json({
    key: item.key,
    title: item.title,
    before: item.before,
    during: item.during,
    after: item.after,
  });
});

const getDisasterQuiz = asyncHandler(async (req, res) => {
  const item = disasterCatalog.find((row) => row.key === req.params.key);
  if (!item) return res.status(404).json({ error: "Disaster module not found" });

  res.json({
    key: item.key,
    title: item.title,
    quiz: item.quiz.map((q, index) => ({
      id: `${item.key}-${index + 1}`,
      question: q.question,
      options: q.options,
    })),
  });
});

const getRandomQuizPool = asyncHandler(async (req, res) => {
  const parsedCount = Number.parseInt(req.query.count, 10);
  const count = Number.isFinite(parsedCount) ? Math.min(Math.max(parsedCount, 3), 12) : 5;
  const requestedDifficulty = ["easy", "medium", "hard"].includes(req.query.difficulty)
    ? req.query.difficulty
    : "medium";
  const difficultyRank = { easy: 1, medium: 2, hard: 3 };

  const fullPool = disasterCatalog.flatMap((item) =>
    item.quiz.map((q, index) => ({
      id: `${item.key}-${index + 1}`,
      moduleKey: item.key,
      moduleTitle: item.title,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty || "medium",
      weakArea: q.weakArea || "Decision Making",
    }))
  );

  let pool = fullPool.filter(
    (item) => difficultyRank[item.difficulty] <= difficultyRank[requestedDifficulty]
  );
  if (pool.length < count) {
    pool = fullPool;
  }

  const quiz = shuffle(pool).slice(0, Math.min(count, pool.length));
  const questionIds = quiz.map((q) => q.id);
  const sessionToken = jwt.sign(
    {
      type: "quiz-pool-session",
      uid: req.user.id,
      qids: questionIds,
    },
    getQuizSessionSecret(),
    {
      expiresIn: process.env.QUIZ_SESSION_EXPIRES_IN || "15m",
      jwtid: crypto.randomUUID(),
    }
  );
  const decoded = jwt.decode(sessionToken);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null;

  res.json({
    count: quiz.length,
    requestedDifficulty,
    quiz,
    sessionToken,
    expiresAt,
  });
});

const submitRandomQuizPool = asyncHandler(async (req, res) => {
  const token = req.body?.sessionToken;
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];

  if (!token) {
    await logQuizSecurityEvent({ req, outcome: "invalid", reason: "missing_session_token" });
    return res.status(400).json({ error: "sessionToken is required" });
  }
  if (!answers.length) {
    await logQuizSecurityEvent({ req, outcome: "invalid", reason: "missing_answers" });
    return res.status(400).json({ error: "answers are required" });
  }

  let payload;
  try {
    payload = jwt.verify(token, getQuizSessionSecret());
  } catch (error) {
    await logQuizSecurityEvent({ req, outcome: "invalid", reason: "invalid_or_expired_session" });
    return res.status(401).json({ error: "Invalid or expired quiz session" });
  }

  if (payload?.type !== "quiz-pool-session" || payload?.uid !== req.user.id) {
    await logQuizSecurityEvent({
      req,
      sessionId: payload?.jti,
      outcome: "rejected",
      reason: "session_user_mismatch",
    });
    return res.status(403).json({ error: "Quiz session does not match user" });
  }

  const sessionId = payload?.jti;
  if (!sessionId) {
    await logQuizSecurityEvent({ req, outcome: "invalid", reason: "missing_session_id" });
    return res.status(400).json({ error: "Quiz session is missing an identifier" });
  }

  const replayKey = `quiz-session-used:${req.user.id}:${sessionId}`;
  if (getCache(replayKey)) {
    await logQuizSecurityEvent({ req, sessionId, outcome: "replay_blocked", reason: "session_reused" });
    return res.status(409).json({ error: "This quiz session was already submitted" });
  }

  const questionIds = Array.isArray(payload?.qids) ? payload.qids : [];
  if (!questionIds.length) {
    await logQuizSecurityEvent({ req, sessionId, outcome: "invalid", reason: "invalid_session_payload" });
    return res.status(400).json({ error: "Quiz session payload is invalid" });
  }

  const answersById = new Map();
  for (const answer of answers) {
    if (!answer || typeof answer.id !== "string" || !Number.isInteger(answer.selectedIndex)) {
      continue;
    }
    answersById.set(answer.id, answer.selectedIndex);
  }

  if (answersById.size !== questionIds.length) {
    await logQuizSecurityEvent({ req, sessionId, outcome: "rejected", reason: "incomplete_answers" });
    return res.status(400).json({ error: "All issued quiz questions must be answered once" });
  }

  const unexpectedId = [...answersById.keys()].find((id) => !questionIds.includes(id));
  if (unexpectedId) {
    await logQuizSecurityEvent({ req, sessionId, outcome: "rejected", reason: "unexpected_question_id" });
    return res.status(400).json({ error: "Submitted answers do not match the issued quiz set" });
  }

  const questionMap = getQuizQuestionMap();

  let validCount = 0;
  let correctCount = 0;
  const weakAreaMisses = new Map();
  const feedback = [];

  for (const questionId of questionIds) {
    const selectedIndex = answersById.get(questionId);
    const question = questionMap.get(questionId);
    const expected = question?.answerIndex;
    if (typeof expected !== "number" || !question) continue;
    validCount += 1;
    const isCorrect = selectedIndex === expected;
    if (isCorrect) {
      correctCount += 1;
    } else {
      weakAreaMisses.set(question.weakArea, (weakAreaMisses.get(question.weakArea) || 0) + 1);
    }

    feedback.push({
      id: questionId,
      moduleKey: question.moduleKey,
      moduleTitle: question.moduleTitle,
      difficulty: question.difficulty,
      weakArea: question.weakArea,
      isCorrect,
      explanation: question.explanation,
      tip: question.tip,
    });
  }

  if (!validCount) {
    await logQuizSecurityEvent({ req, sessionId, outcome: "invalid", reason: "no_valid_answers" });
    return res.status(400).json({ error: "No valid answers submitted" });
  }

  const score = Math.round((correctCount / validCount) * 100);
  const weakAreas = [...weakAreaMisses.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([area, misses]) => ({ area, misses }));
  const ttlMs = payload?.exp ? Math.max(payload.exp * 1000 - Date.now(), 60 * 1000) : 15 * 60 * 1000;
  setCache(replayKey, true, ttlMs);

  const submittedAt = new Date().toISOString();
  const audit = {
    sessionId,
    submittedAt,
  };

  await logQuizSecurityEvent({
    req,
    sessionId,
    outcome: "success",
    score,
    total: validCount,
    correct: correctCount,
  });

  const ipHash = hashValue(resolveClientIp(req));
  const userAgentHash = hashValue(req.headers["user-agent"] || "unknown");

  console.info(
    "[quiz-audit]",
    JSON.stringify({
      action: "quiz_pool_submit",
      userId: req.user.id,
      sessionId,
      submittedAt,
      score,
      total: validCount,
      correct: correctCount,
      ipHash,
      userAgentHash,
    })
  );

  res.json({
    score,
    total: validCount,
    correct: correctCount,
    feedback,
    weakAreas,
    audit,
  });
});

const getQuizSecuritySummary = asyncHandler(async (req, res) => {
  const hours = Number.parseInt(req.query.hours, 10);
  const lookbackHours = Number.isFinite(hours) ? Math.min(Math.max(hours, 1), 168) : 24;
  const from = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

  const [events, grouped] = await Promise.all([
    QuizSecurityEvent.find({ submittedAt: { $gte: from } })
      .sort({ submittedAt: -1 })
      .limit(20)
      .lean(),
    QuizSecurityEvent.aggregate([
      { $match: { submittedAt: { $gte: from } } },
      { $group: { _id: "$outcome", count: { $sum: 1 } } },
    ]),
  ]);

  const counts = grouped.reduce(
    (acc, item) => ({ ...acc, [item._id]: item.count }),
    { success: 0, replay_blocked: 0, rejected: 0, invalid: 0 }
  );

  const replayAttempts = counts.replay_blocked;
  const rejectionCount = counts.rejected + counts.invalid;
  const successCount = counts.success;

  res.json({
    windowHours: lookbackHours,
    summary: {
      successCount,
      replayAttempts,
      rejectionCount,
      totalEvents: successCount + replayAttempts + rejectionCount,
    },
    recent: events.map((item) => ({
      id: item._id,
      outcome: item.outcome,
      reason: item.reason || null,
      sessionId: item.sessionId || null,
      score: item.score ?? null,
      submittedAt: item.submittedAt,
    })),
  });
});

module.exports = {
  listDisasters,
  getDisasterGuidance,
  getDisasterQuiz,
  getRandomQuizPool,
  submitRandomQuizPool,
  getQuizSecuritySummary,
};
