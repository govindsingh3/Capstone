const express = require("express");
const { auth } = require("../middleware/auth");
const { listLiveAlerts } = require("../controllers/alertController");

const router = express.Router();

router.get("/live", auth, listLiveAlerts);

module.exports = router;
