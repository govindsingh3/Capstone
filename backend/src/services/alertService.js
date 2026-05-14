const axios = require("axios");
const { getCache, setCache } = require("../utils/simpleCache");

const CACHE_TTL_MS = 5 * 60 * 1000;

const toLevel = (severity) => {
  if (severity >= 3) return "High";
  if (severity >= 2) return "Medium";
  return "Low";
};

const buildWeatherAlerts = async (lat, lon) => {
  const url = "https://api.open-meteo.com/v1/forecast";
  const { data } = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: "temperature_2m_max,precipitation_probability_max,windspeed_10m_max",
      timezone: "auto",
      forecast_days: 2,
    },
    timeout: 4500,
  });

  const rainProb = Number(data?.daily?.precipitation_probability_max?.[0] || 0);
  const windKmh = Number(data?.daily?.windspeed_10m_max?.[0] || 0);
  const tempMax = Number(data?.daily?.temperature_2m_max?.[0] || 0);

  const alerts = [];

  if (rainProb >= 70) {
    alerts.push({
      source: "weather",
      type: "Flood Risk",
      title: "Heavy rainfall probability is high",
      description: `Precipitation probability is ${rainProb}% in your area.`,
      level: rainProb >= 85 ? "High" : "Medium",
      timestamp: new Date().toISOString(),
    });
  }

  if (windKmh >= 45) {
    alerts.push({
      source: "weather",
      type: "Storm Wind",
      title: "Strong wind conditions expected",
      description: `Wind speed could reach ${windKmh} km/h.`,
      level: windKmh >= 60 ? "High" : "Medium",
      timestamp: new Date().toISOString(),
    });
  }

  if (tempMax >= 39) {
    alerts.push({
      source: "weather",
      type: "Heatwave",
      title: "High heat conditions likely",
      description: `Maximum temperature forecast is ${tempMax}°C.`,
      level: tempMax >= 42 ? "High" : "Medium",
      timestamp: new Date().toISOString(),
    });
  }

  return alerts;
};

const buildEarthquakeAlerts = async () => {
  const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  const { data } = await axios.get(url, { timeout: 4500 });
  const items = data?.features || [];

  return items
    .filter((item) => Number(item?.properties?.mag || 0) >= 4)
    .slice(0, 4)
    .map((item) => {
      const mag = Number(item.properties.mag || 0);
      return {
        source: "earthquake",
        type: "Seismic Activity",
        title: item.properties.place || "Earthquake event",
        description: `Magnitude ${mag.toFixed(1)} earthquake reported.`,
        level: toLevel(mag >= 6 ? 3 : mag >= 5 ? 2 : 1),
        timestamp: new Date(item.properties.time || Date.now()).toISOString(),
      };
    });
};

const fallbackAlerts = [
  {
    source: "system",
    type: "Preparedness Notice",
    title: "Monthly evacuation drill due this week",
    description: "Complete classroom evacuation rehearsal and roll-call validation.",
    level: "Info",
    timestamp: new Date().toISOString(),
  },
  {
    source: "system",
    type: "Flood Watch",
    title: "Low-lying zones need precautionary checks",
    description: "Inspect drainage and emergency kit stock before evening rainfall.",
    level: "Medium",
    timestamp: new Date().toISOString(),
  },
];

const getLiveAlerts = async ({ lat, lon }) => {
  const cacheKey = `alerts:${lat || "default"}:${lon || "default"}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const weatherAlerts = lat && lon ? await buildWeatherAlerts(lat, lon) : [];
    const earthquakeAlerts = await buildEarthquakeAlerts();
    const merged = [...weatherAlerts, ...earthquakeAlerts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const payload = {
      generatedAt: new Date().toISOString(),
      locationAware: Boolean(lat && lon),
      alerts: merged.length ? merged : fallbackAlerts,
    };

    setCache(cacheKey, payload, CACHE_TTL_MS);
    return payload;
  } catch (error) {
    const payload = {
      generatedAt: new Date().toISOString(),
      locationAware: Boolean(lat && lon),
      degraded: true,
      alerts: fallbackAlerts,
    };
    setCache(cacheKey, payload, CACHE_TTL_MS);
    return payload;
  }
};

module.exports = { getLiveAlerts };
