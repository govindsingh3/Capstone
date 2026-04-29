const Joi = require("joi");

const predictionSchema = Joi.object({
  institutionId: Joi.string().required(),
  drillFrequency: Joi.number().min(0).required(),
  infrastructureScore: Joi.number().min(0).max(100).required(),
  awarenessScore: Joi.number().min(0).max(100).required(),
  trainingHours: Joi.number().min(0).required(),
  incidentHistory: Joi.number().min(0).required(),
  participationRate: Joi.number().min(0).max(100).required(),
});

module.exports = { predictionSchema };
