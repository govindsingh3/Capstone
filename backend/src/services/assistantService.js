const axios = require("axios");
const { getLiveAlerts } = require("./alertService");

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const XAI_CHAT_URL = process.env.XAI_CHAT_URL || "https://api.x.ai/v1/chat/completions";
const XAI_RESPONSES_URL = process.env.XAI_RESPONSES_URL || "https://api.x.ai/v1/responses";
const XAI_API_KEY = process.env.XAI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_KEY = XAI_API_KEY || OPENAI_API_KEY;
const AI_PROVIDER = (process.env.AI_PROVIDER || "auto").toLowerCase();

const isXaiKey = AI_KEY?.startsWith("gsk_");
const useXaiProvider = AI_PROVIDER === "xai" || Boolean(XAI_API_KEY) || isXaiKey;
const MODEL_NAME = useXaiProvider ? process.env.XAI_MODEL || "grok-4.20-reasoning" : process.env.OPENAI_MODEL || "gpt-3.5-turbo";

const alertTrigger = /\b(flood|rain|storm|weather|forecast|precipitation|temperature|wind|alert|hazard|earthquake|seismic|tremor|fire|smoke|evacuation|drill|training|preparedness|safety|disaster|shelter|assembly)\b/i;

const buildAlertSummary = (payload) => {
  if (!payload?.alerts?.length) {
    return "No active live alerts were found. Conditions appear stable right now.";
  }

  const lines = payload.alerts.slice(0, 4).map((alert) => {
    const level = alert.level ? ` (${alert.level})` : "";
    return `• ${alert.title}${level}: ${alert.description}`;
  });

  return `Current hazard summary:\n${lines.join("\n")}`;
};

const buildSystemMessage = (useAlerts) => {
  const base = [
    "You are a DPRES safety assistant for students and disaster-preparedness users.",
    "Answer clearly and calmly, using friendly language suited for students.",
    "Focus on disaster preparedness, drills, evacuation, weather alerts, fire safety, earthquake safety, and classroom readiness.",
    "If live alert data is provided, include it when relevant in your answer.",
  ];

  if (useAlerts) {
    base.push("If the question mentions weather, floods, earthquakes, fires, or alerts, use the provided live alert summary in your response.");
  }

  return base.join(" ");
};

const localFallback = async (question) => {
  const normalized = question?.trim?.();
  if (!normalized) {
    return "Please ask a safety question about disaster preparedness, live alerts, drills, or evacuation.";
  }

  const lower = normalized.toLowerCase();
  if (/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/.test(lower)) {
    return "Hello! I am your DPRES safety assistant. Ask me about safety, disaster preparedness, live alerts, drills, or evacuation and I will help you.";
  }

  if (/\b(disaster|disater)\b/.test(lower) || /\bwhat is (a )?disaster\b/.test(lower) || /\bdefine disaster\b/.test(lower) || /\bmeaning of disaster\b/.test(lower)) {
    return "A disaster is a serious event that causes harm, damage, or disruption. DPRES focuses on hazards like floods, earthquakes, fires, and storms so students can stay safe and prepared.";
  }

  if (/\bdrill\b/.test(lower) || /\bpractice\b/.test(lower) || /\btraining\b/.test(lower)) {
    return "A drill is a planned exercise that helps people practice what to do in an emergency. Regular drills improve response time, reduce panic, and make real evacuations safer.";
  }

  if (/\b(prepare|preparation|preparedness|ready|readying|get ready)\b/.test(lower)) {
    return "To prepare, learn your emergency route, review safety procedures, keep emergency supplies ready, join drills, and stay aware of local hazard alerts.";
  }

  if (/\b(earthquake|seismic|tremor|quake)\b/.test(lower)) {
    return "Earthquake safety: Drop, Cover, and Hold under sturdy furniture while shaking continues. After shaking stops, move to a safe evacuation area and avoid glass or unstable structures.";
  }

  if (/\b(fire|smoke|exit|flame|burn)\b/.test(lower)) {
    return "Fire safety: Alert others, leave immediately using stairs, avoid elevators, and stay low if smoke is present. Follow your building's evacuation plan and meet at the assembly point.";
  }

  if (/\b(flood|rain|storm|weather|forecast|precipitation|wind|hazard|alert)\b/.test(lower)) {
    const payload = await getLiveAlerts({});
    return `${buildAlertSummary(payload)}\n\nIf you are in a risky area, move to higher ground and stay away from flooded routes.`;
  }

  if (/\b(shelter|safe zone|assembly|meeting point|safe place)\b/.test(lower)) {
    return "A safe place depends on the hazard. For floods, go higher. For earthquakes, shelter under strong furniture then evacuate when safe. For fires, use stairs and go to the designated assembly point.";
  }

  if (/\b(kit|supplies|emergency kit|first aid)\b/.test(lower)) {
    return "An emergency kit should include water, snacks, a flashlight, batteries, a first-aid kit, and important documents. Keep it ready and easy to access.";
  }

  return "I can answer safety and disaster preparedness questions. Ask me about floods, earthquakes, fires, drills, evacuation plans, or how to stay safe during an emergency.";
};

const getAIResponse = async (question) => {
  if (!question || !question.trim()) {
    return "Please ask a safety question so I can help. Try a question about weather, earthquakes, fire, or drills.";
  }

  const useAlerts = alertTrigger.test(question);
  let alertSection = "";

  if (useAlerts) {
    const payload = await getLiveAlerts({});
    alertSection = `Here are the latest live alerts available:\n${buildAlertSummary(payload)}\n\n`;
  }

  if (!AI_KEY) {
    return `${alertSection}${await localFallback(question)}`;
  }

  try {
    const messages = [
      { role: "system", content: buildSystemMessage(useAlerts) },
      { role: "user", content: `${alertSection}${question}`.trim() },
    ];

    let response;
    const requestHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_KEY}`,
    };

    if (useXaiProvider) {
      const requestUrl = XAI_RESPONSES_URL;
      const requestData = {
        model: MODEL_NAME,
        input: `${buildSystemMessage(useAlerts)}\n\n${alertSection}${question}`.trim(),
        temperature: 0.7,
        max_output_tokens: 512,
        store: false,
      };

      response = await axios.post(requestUrl, requestData, {
        headers: requestHeaders,
        timeout: 12000,
      });
    } else {
      const requestUrl = OPENAI_API_URL;
      const requestData = {
        model: MODEL_NAME,
        messages,
        temperature: 0.7,
        max_tokens: 512,
      };

      response = await axios.post(requestUrl, requestData, {
        headers: requestHeaders,
        timeout: 12000,
      });
    }

    let answer;
    if (useXaiProvider) {
      const output = response?.data?.output?.[0];
      answer = output?.content?.find((item) => item.type === "output_text")?.text
        || output?.content?.[0]?.text
        || output?.text
        || response?.data?.output?.[0]?.content?.map?.((item) => item.text || "").join(" ");
      answer = answer?.trim();
    } else {
      answer = response?.data?.choices?.[0]?.message?.content?.trim();
    }

    if (answer) return answer;
    return `${alertSection}${await localFallback(question)}`;
  } catch (error) {
    console.error("AI request failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      provider: useXaiProvider ? "xai" : "openai",
    });

    const fallbackAnswer = await localFallback(question);
    if (error.response?.status === 429) {
      return `The AI provider is currently unavailable due to quota limits. ${fallbackAnswer}`;
    }

    if (error.response?.status === 401) {
      return `The configured AI key appears invalid for the selected provider. Please check your API key and provider settings. ${fallbackAnswer}`;
    }

    return fallbackAnswer;
  }
};

module.exports = { getAIResponse };
