const Prediction = require("../models/Prediction");
const Drill = require("../models/Drill");
const Institution = require("../models/Institution");
const { asyncHandler } = require("../utils/asyncHandler");

const generateReport = asyncHandler(async (req, res) => {
  const { institutionId } = req.query;
  const institution = await Institution.findById(institutionId);
  const predictions = await Prediction.find({ institutionId }).sort({ createdAt: -1 }).limit(5);
  const drills = await Drill.find({ institutionId }).sort({ conductedAt: -1 }).limit(5);

  res.json({
    institution,
    predictions,
    drills,
    generatedAt: new Date(),
  });
});

module.exports = { generateReport };
