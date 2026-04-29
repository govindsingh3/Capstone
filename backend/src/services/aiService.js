const axios = require("axios");

const api = axios.create({
  baseURL: process.env.AI_API_BASE_URL,
  timeout: 5000,
});

const getPrediction = async (payload) => {
  try {
    const response = await api.post("/predict", payload);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.error || err.message;
    const error = new Error(`AI prediction failed: ${message}`);
    error.status = 502;
    throw error;
  }
};

const getExplanation = async (payload) => {
  try {
    const response = await api.post("/explain", payload);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.error || err.message;
    const error = new Error(`AI explanation failed: ${message}`);
    error.status = 502;
    throw error;
  }
};

module.exports = { getPrediction, getExplanation };
