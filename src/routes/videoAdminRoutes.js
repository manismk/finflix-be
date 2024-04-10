const express = require("express");
const videoController = require("../controllers/videoController");
const router = express.Router();

router.post("/", videoController.createVideo);
router.put("/:id", videoController.updateVideo);

const videoAdminRoutes = router;

module.exports = videoAdminRoutes;
