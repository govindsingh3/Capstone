const Drill = require("../models/Drill");
const Prediction = require("../models/Prediction");
const { asyncHandler } = require("../utils/asyncHandler");

const getDashboardStats = asyncHandler(async (req, res) => {
  const institutionId = req.query.institutionId;
  const [latestPrediction] = await Prediction.find({ institutionId })
    .sort({ createdAt: -1 })
    .limit(1);

  const drills = await Drill.find({ institutionId }).sort({ conductedAt: -1 }).limit(20);

  res.json({
    latestPrediction,
    drills,
  });
});

module.exports = { getDashboardStats };
