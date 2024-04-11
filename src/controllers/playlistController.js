const mongoose = require("mongoose");
const zod = require("zod");
const User = require("../models/User");
const Playlist = require("../models/Playlist");
const Video = require("../models/Video");

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

    const user = await User.findById(userId).populate({
      path: "playlists",
      populate: {
        path: "videos",
        model: "Video", // optional
        populate: [{ path: "creator" }, { path: "category" }],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const playlists = user.playlists;

    const formatterPlaylists = playlists.map((playlist) => ({
      _id: playlist._id,
      name: playlist.name,
      videos: playlist.videos.map((video) => ({
        _id: video._id,
        title: video.title,
        creator: video.creator.name,
        creatorImgUrl: video.creator.img_url,
        description: video.description,
        duration: video.duration,
        category: video.category.name,
      })),
    }));

    return res.json(formatterPlaylists);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const addVideoToPlaylist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const playlistId = req.params.playlistId;
    const videoId = req.params.videoId;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(playlistId)
    ) {
      return res.status(411).json({ message: "Invalid user input" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    if (playlist.videos.includes(videoId)) {
      return res.json({ message: "Video is already present in playlist" });
    } else {
      playlist.videos.push(videoId);
      await playlist.save();
      return res.json({ message: "Video added to playlist successfully" });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const removeVideoFromPlaylist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const playlistId = req.params.playlistId;
    const videoId = req.params.videoId;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(playlistId)
    ) {
      return res.status(411).json({ message: "Invalid user input" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    const playlistIndex = playlist.videos.indexOf(videoId);
    if (playlistIndex === -1) {
      return res.json({ message: "Video is not present in playlist" });
    } else {
      playlist.videos.splice(playlistIndex, 1);
      await playlist.save();
      return res.json({ message: "Video removed from playlist successfully" });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const playlistController = {
  createPlaylist,
  getAllPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
};

module.exports = playlistController;
