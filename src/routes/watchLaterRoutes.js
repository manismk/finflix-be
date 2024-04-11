const express = require("express");
const watchLaterController = require("../controllers/watchLaterController");
const router = express.Router();

router.get("/watch-later", watchLaterController.getAllWatchLater);
router.post("/watch-later", watchLaterController.addToWatchLaterVideo);
router.delete("/watch-later", watchLaterController.removeFromWatchLater);

const watchLaterRoutes = router;

module.exports = watchLaterRoutes;
