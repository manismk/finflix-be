const express = require("express");
const playlistController = require("../controllers/playlistController");
const router = express.Router();

router.get("/playlist", playlistController.getAllPlaylists);
router.post("/playlist", playlistController.createPlaylist);
router.post(
  "/playlist/:playlistId/:videoId",
  playlistController.addVideoToPlaylist
);
router.delete(
  "/playlist/:playlistId/:videoId",
  playlistController.removeVideoFromPlaylist
);

const playlistRoutes = router;

module.exports = playlistRoutes;
