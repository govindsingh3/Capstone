import api from "./api.js";

export const fetchLiveAlerts = async ({ lat, lon } = {}) => {
  const params = {};
  if (typeof lat === "number" && typeof lon === "number") {
    params.lat = lat;
    params.lon = lon;
  }

  const response = await api.get("/alerts/live", { params });
  return response.data;
};
