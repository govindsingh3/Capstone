import api from "./api.js";

export const fetchNearbyResources = async ({ lat, lon, type = "all", limit = 6 }) => {
  const response = await api.get("/resources/nearby", {
    params: { lat, lon, type, limit },
  });
  return response.data;
};
