const Joi = require("joi");

const institutionDataSchema = Joi.object({
  institutionId: Joi.string().min(4).optional(),
  name: Joi.string().min(2).required(),
  city: Joi.string().allow("").optional(),
  state: Joi.string().allow("").optional(),
  type: Joi.string().valid("Central", "State", "Deemed", "Private").optional(),
  address: Joi.string().allow("").optional(),
  website: Joi.string().uri().optional(),
  contactEmail: Joi.string().email().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  accreditation: Joi.string().allow("").optional(),
  status: Joi.string().valid("Active", "Dormant", "De-recognized").optional(),
  disasterMetadata: Joi.object({
    earthquakeZone: Joi.string().valid("II", "III", "IV", "V").optional(),
    floodRisk: Joi.string().valid("Low", "Medium", "High").optional(),
    cycloneRisk: Joi.string().valid("Low", "Medium", "High").optional(),
  }).optional(),
  infrastructureScore: Joi.number().min(0).max(100).optional(),
  trainingHours: Joi.number().min(0).optional(),
  awarenessScore: Joi.number().min(0).max(100).optional(),
  incidentHistory: Joi.number().min(0).optional(),
  drillFrequency: Joi.number().min(0).optional(),
});

const institutionsImportSchema = Joi.object({
  institutions: Joi.array()
    .items(
      institutionDataSchema.keys({
        name: Joi.string().min(2).required(),
      })
    )
    .min(1)
    .required(),
});

module.exports = { institutionDataSchema, institutionsImportSchema };
