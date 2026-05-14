import api from "./api.js";

export const fetchQuizSecuritySummary = async (hours = 24) => {
  const response = await api.get(`/disasters/quiz-pool/security-summary?hours=${hours}`);
  return response.data;
};
