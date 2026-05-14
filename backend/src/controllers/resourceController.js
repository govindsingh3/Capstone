const Joi = require("joi");
const { asyncHandler } = require("../utils/asyncHandler");
const { resourcesCatalog } = require("../data/resourcesCatalog");

const querySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required(),
  type: Joi.string().valid("hospital", "shelter", "police", "all").default("all"),
  limit: Joi.number().integer().min(1).max(20).default(6),
});

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
};

const listNearbyResources = asyncHandler(async (req, res) => {
  const { value, error } = querySchema.validate(req.query);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { lat, lon, type, limit } = value;

  const filtered = resourcesCatalog
    .filter((item) => (type === "all" ? true : item.type === type))
    .map((item) => ({
      ...item,
      distanceKm: Number(haversineKm(lat, lon, item.latitude, item.longitude).toFixed(2)),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  return res.json({
    reference: { lat, lon },
    type,
    count: filtered.length,
    resources: filtered,
  });
});

module.exports = { listNearbyResources };
