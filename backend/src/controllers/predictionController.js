const Prediction = require("../models/Prediction");
const { getPrediction, getExplanation } = require("../services/aiService");
const { asyncHandler } = require("../utils/asyncHandler");

const createPrediction = asyncHandler(async (req, res) => {
  const prediction = await getPrediction(req.body);
  const explanation = await getExplanation(req.body);

  const record = await Prediction.create({
    institutionId: req.body.institutionId,
    readinessCategory: prediction.readinessCategory,
    readinessScore: prediction.readinessScore,
    confidenceScore: prediction.confidenceScore,
    topRiskFactors: prediction.topRiskFactors || [],
    shapValues: explanation.shapValues || [],
    inputFeatures: {
      drillFrequency: req.body.drillFrequency,
      infrastructureScore: req.body.infrastructureScore,
      awarenessScore: req.body.awarenessScore,
      trainingHours: req.body.trainingHours,
      incidentHistory: req.body.incidentHistory,
      participationRate: req.body.participationRate,
    },
  });

  res.status(201).json(record);
});

const listPredictions = asyncHandler(async (req, res) => {
  const results = await Prediction.find({ institutionId: req.query.institutionId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(results);
});

module.exports = { createPrediction, listPredictions };
