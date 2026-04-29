const express = require("express");
const { auth } = require("../middleware/auth");
const { roleGuard } = require("../middleware/role");
const { generateReport } = require("../controllers/reportController");

const router = express.Router();

router.get(
  "/institution",
  auth,
  roleGuard(["Administrator", "Teacher", "DisasterOfficer"]),
  generateReport
);

module.exports = router;
