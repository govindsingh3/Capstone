const express = require("express");
const { auth } = require("../middleware/auth");
const { roleGuard } = require("../middleware/role");
const { validate } = require("../middleware/validate");
const { drillSchema } = require("../validators/simulationSchemas");
const { createDrill, listDrills } = require("../controllers/simulationController");

const router = express.Router();

router.get("/", auth, listDrills);
router.post(
  "/",
  auth,
  roleGuard(["Administrator", "Teacher", "DisasterOfficer"]),
  validate(drillSchema),
  createDrill
);

module.exports = router;
