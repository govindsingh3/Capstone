const express = require("express");

const authRoutes = require("./authRoutes");
const educationRoutes = require("./educationRoutes");
const simulationRoutes = require("./simulationRoutes");
const dataRoutes = require("./dataRoutes");
const predictionRoutes = require("./predictionRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const reportRoutes = require("./reportRoutes");
const alertRoutes = require("./alertRoutes");
const resourceRoutes = require("./resourceRoutes");
const disasterRoutes = require("./disasterRoutes");
const aiRoutes = require("./aiRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/education", educationRoutes);
router.use("/simulations", simulationRoutes);
router.use("/data", dataRoutes);
router.use("/predictions", predictionRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/reports", reportRoutes);
router.use("/alerts", alertRoutes);
router.use("/resources", resourceRoutes);
router.use("/disasters", disasterRoutes);
router.use("/ai", aiRoutes);

module.exports = router;
