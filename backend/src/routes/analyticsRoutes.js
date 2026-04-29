const express = require("express");
const { auth } = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/dashboard", auth, getDashboardStats);

module.exports = router;
