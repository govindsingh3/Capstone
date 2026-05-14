const Joi = require("joi");
const { asyncHandler } = require("../utils/asyncHandler");
const { getLiveAlerts } = require("../services/alertService");

const querySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).optional(),
  lon: Joi.number().min(-180).max(180).optional(),
});

const listLiveAlerts = asyncHandler(async (req, res) => {
  const { value, error } = querySchema.validate(req.query);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const payload = await getLiveAlerts({ lat: value.lat, lon: value.lon });
  return res.json(payload);
});

module.exports = { listLiveAlerts };
