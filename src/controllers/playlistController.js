const mongoose = require("mongoose");
const zod = require("zod");
const User = require("../models/User");
const Playlist = require("../models/Playlist");

const createPlaylistSchema = zod.object({
  name: zod.string().min(1),
});

const createPlaylist = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(411).json({ message: "Invalid user input" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const zodResponse = createPlaylistSchema.safeParse(req.body);
    if (!zodResponse.success) {
      return res
        .status(411)
        .json({ message: "Invalid user input", errors: zodResponse.error });
    }
    const { name } = zodResponse.data;

    const newPlaylist = await Playlist.create({ name, user: userId });
    await User.findByIdAndUpdate(
      userId,
      { $push: { playlists: newPlaylist._id } },
      { new: true }
    );
    return res.status(200).json({ message: "Playlist created successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllPlaylists = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(411).json({ message: "Invalid user input" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user.playlists);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const playlistController = { createPlaylist, getAllPlaylists };

module.exports = playlistController;
