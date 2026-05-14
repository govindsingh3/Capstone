const { getAIResponse } = require("../services/assistantService");
const { asyncHandler } = require("../utils/asyncHandler");

const aiChat = asyncHandler(async (req, res) => {
  const question = req.body?.question?.toString?.().trim?.();
  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }

  const answer = await getAIResponse(question);
  return res.json({ answer });
});

module.exports = { aiChat };
