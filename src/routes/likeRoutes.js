const express = require("express");
const likeContoller = require("../controllers/likeController");
const router = express.Router();

router.get("/liked-videos", likeContoller.getAllLikedVideos);
router.post("/like", likeContoller.likeVideo);
router.post("/dislike", likeContoller.disLikeVideo);

const likeRoutes = router;

module.exports = likeRoutes;
