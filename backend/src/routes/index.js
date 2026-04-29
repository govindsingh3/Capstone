const express = require("express");

const authRoutes = require("./authRoutes");
const educationRoutes = require("./educationRoutes");
const simulationRoutes = require("./simulationRoutes");
const dataRoutes = require("./dataRoutes");
const predictionRoutes = require("./predictionRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const reportRoutes = require("./reportRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/education", educationRoutes);
router.use("/simulations", simulationRoutes);
router.use("/data", dataRoutes);
router.use("/predictions", predictionRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/reports", reportRoutes);

module.exports = router;
