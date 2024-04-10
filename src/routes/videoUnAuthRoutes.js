const express = require("express");
const videoController = require("../controllers/videoController");
const router = express.Router();

router.get("/all", videoController.getAllVideos);
router.get("/:id", videoController.getVideoById);

const videoUnAuthRoutes = router;

module.exports = videoUnAuthRoutes;
