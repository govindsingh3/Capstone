import api from "./api.js";

export const fetchDisasterModules = async () => {
  const response = await api.get("/disasters");
  return response.data;
};

export const fetchDisasterGuidance = async (key) => {
  const response = await api.get(`/disasters/${key}/guidance`);
  return response.data;
};

export const fetchDisasterQuiz = async (key) => {
  const response = await api.get(`/disasters/${key}/quiz`);
  return response.data;
};

export const fetchRandomDisasterQuiz = async ({ count = 5, difficulty = "medium" } = {}) => {
  const response = await api.get(`/disasters/quiz-pool?count=${count}&difficulty=${difficulty}`);
  return response.data;
};

export const submitRandomDisasterQuiz = async ({ sessionToken, answers }) => {
  const response = await api.post("/disasters/quiz-pool/submit", { sessionToken, answers });
  return response.data;
};
