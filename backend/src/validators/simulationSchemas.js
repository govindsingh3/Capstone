const Joi = require("joi");

const drillSchema = Joi.object({
  institutionId: Joi.string().required(),
  type: Joi.string().valid("Fire", "Earthquake", "Evacuation").required(),
  participationRate: Joi.number().min(0).max(100).required(),
  responseTime: Joi.number().min(1).max(300).required(),
  coordinationScore: Joi.number().min(0).max(100).required(),
  notes: Joi.string().allow("").optional(),
});

module.exports = { drillSchema };
