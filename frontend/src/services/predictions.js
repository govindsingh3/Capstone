import api from "./api.js";

export const fetchDashboard = (institutionId) =>
  api.get(`/analytics/dashboard?institutionId=${institutionId}`);

export const createPrediction = (payload) => api.post("/predictions", payload);
