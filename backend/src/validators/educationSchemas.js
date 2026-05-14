const Joi = require("joi");

const contentSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow("").optional(),
  type: Joi.string().valid("Video", "Quiz", "Infographic").required(),
  url: Joi.string().uri().optional(),
  metadata: Joi.object().optional(),
});

const quizResultSchema = Joi.object({
  contentId: Joi.string().optional(),
  contentKey: Joi.string().min(2).optional(),
  score: Joi.number().min(0).max(100).required(),
  attempts: Joi.number().min(1).optional(),
  difficulty: Joi.string().valid("easy", "medium", "hard").optional(),
  weakAreas: Joi.array().items(Joi.string().min(2)).max(6).optional(),
}).or("contentId", "contentKey");

module.exports = { contentSchema, quizResultSchema };
