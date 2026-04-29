const Drill = require("../models/Drill");
const SimulationLog = require("../models/SimulationLog");
const { computeDrillScore } = require("../utils/score");
const { asyncHandler } = require("../utils/asyncHandler");

const createDrill = asyncHandler(async (req, res) => {
  const performanceScore = computeDrillScore(req.body);
  const drill = await Drill.create({
    ...req.body,
    performanceScore,
  });

  if (req.body.notes) {
    await SimulationLog.create({
      institutionId: req.body.institutionId,
      drillId: drill._id,
      notes: req.body.notes,
      recordedBy: req.user.id,
    });
  }

  res.status(201).json(drill);
});

const listDrills = asyncHandler(async (req, res) => {
  const drills = await Drill.find({ institutionId: req.query.institutionId })
    .sort({ conductedAt: -1 })
    .limit(100);
  res.json(drills);
});

module.exports = { createDrill, listDrills };
