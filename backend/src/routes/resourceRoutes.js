const express = require("express");
const { auth } = require("../middleware/auth");
const { listNearbyResources } = require("../controllers/resourceController");

const router = express.Router();

router.get("/nearby", auth, listNearbyResources);

module.exports = router;
