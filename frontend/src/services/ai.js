import api from "./api";

const fallbackResponse = `I can answer student safety questions about disaster preparedness, drills, evacuation, and current hazard alerts. Ask me about weather, floods, earthquakes, fire safety, or how to stay ready.`;

export const askAiQuestion = async (question) => {
  const normalized = question?.toString()?.trim?.();
  if (!normalized) return fallbackResponse;

  try {
    const { data } = await api.post("/ai/chat", { question: normalized });
    const answer = data?.answer?.toString?.().trim?.();
    if (answer) return answer;
    return fallbackResponse;
  } catch (error) {
    return `Sorry, I couldn't reach the AI assistant right now. ${fallbackResponse}`;
  }
};
