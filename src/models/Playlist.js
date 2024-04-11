const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  videos: [{ type: String, ref: "Video" }],
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
