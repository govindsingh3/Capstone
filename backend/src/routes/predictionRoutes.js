const express = require("express");
const { auth } = require("../middleware/auth");
const { roleGuard } = require("../middleware/role");
const { validate } = require("../middleware/validate");
const { predictionSchema } = require("../validators/predictionSchemas");
const { createPrediction, listPredictions } = require("../controllers/predictionController");

const router = express.Router();

router.get("/", auth, listPredictions);
router.post(
  "/",
  auth,
  roleGuard(["Administrator", "Teacher", "DisasterOfficer"]),
  validate(predictionSchema),
  createPrediction
);

module.exports = router;
