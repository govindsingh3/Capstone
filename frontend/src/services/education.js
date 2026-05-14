import api from "./api.js";

export const submitQuizResult = async ({ contentId, contentKey, score, attempts = 1 }) => {
  const payload = { score, attempts };
  if (contentId) payload.contentId = contentId;
  if (contentKey) payload.contentKey = contentKey;

  const response = await api.post("/education/quiz-results", payload);
  return response.data;
};

export const fetchMyQuizResults = async () => {
  const response = await api.get("/education/quiz-results");
  return response.data;
};

export const fetchQuizLeaderboard = async ({ days = 30, contentKey = "learning-center-self-check" } = {}) => {
  const response = await api.get(
    `/education/quiz-results/leaderboard?days=${days}&contentKey=${encodeURIComponent(contentKey)}`
  );
  return response.data;
};

export const fetchRevisionPlan = async ({ contentKey = "learning-center-self-check" } = {}) => {
  const response = await api.get(
    `/education/quiz-results/revision-plan?contentKey=${encodeURIComponent(contentKey)}`
  );
  return response.data;
};
