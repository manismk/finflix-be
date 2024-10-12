const mongoose = require("mongoose");
const zod = require("zod");
const User = require("../models/User");
const Playlist = require("../models/Playlist");
const Video = require("../models/Video");
const { getVideoInFormat } = require("../utils/getVideoInFormat");

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
    const userRes = await User.findByIdAndUpdate(
      userId,
      { $push: { playlists: newPlaylist._id } },
      { new: true }
    ).populate({
      path: "playlists",
      populate: {
        path: "videos",
        model: "Video", // optional
        populate: [{ path: "creator" }, { path: "category" }],
      },
    });
    const playlists = userRes.playlists;

    const formatterPlaylists = playlists.map((playlist) => ({
      _id: playlist._id,
      name: playlist.name,
      videos: getVideoInFormat({ videos: playlist.videos }),
    }));

    return res.status(201).json({
      message: "Playlist created successfully",
      playlists: formatterPlaylists,
    });
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
      videos: getVideoInFormat({ videos: playlist.videos }),
    }));

    return res.json(formatterPlaylists);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getPlaylistById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const playlistId = req.params.playlistId;

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
    const playlist = await Playlist.findById(playlistId).populate({
      path: "videos",
      model: "Video", // optional
      populate: [{ path: "creator" }, { path: "category" }],
    });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    const formatterPlaylist = {
      _id: playlist._id,
      name: playlist.name,
      videos: getVideoInFormat({ videos: playlist.videos }),
    };
    res.json(formatterPlaylist);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const removePlaylistById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const playlistId = req.params.playlistId;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(playlistId)
    ) {
      return res.status(411).json({ message: "Invalid user input" });
    }
    const userRes = await User.findById(userId);
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
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    const playlistIndex = userRes.playlists.indexOf(playlist._id);
    if (playlistIndex !== -1) {
      user.playlists.splice(playlistIndex, 1);
      user.save();
      await Playlist.findByIdAndDelete(playlistId);
      const playlists = user.playlists;

      const formatterPlaylists = playlists.map((playlist) => ({
        _id: playlist._id,
        name: playlist.name,
        videos: getVideoInFormat({ videos: playlist.videos }),
      }));
      return res.json({
        message: "Playlist deleted successfully",
        playlists: formatterPlaylists,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Playlist is not assosiated with this user" });
    }
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
      const userRes = await User.findById(userId).populate({
        path: "playlists",
        populate: {
          path: "videos",
          model: "Video", // optional
          populate: [{ path: "creator" }, { path: "category" }],
        },
      });
      const playlists = userRes.playlists;

      const formatterPlaylists = playlists.map((playlist) => ({
        _id: playlist._id,
        name: playlist.name,
        videos: getVideoInFormat({ videos: playlist.videos }),
      }));

      return res.status(201).json({
        message: "Video added to playlist successfully",
        playlists: formatterPlaylists,
      });
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
    const videoIndex = playlist.videos.indexOf(videoId);
    if (videoIndex === -1) {
      return res.json({ message: "Video is not present in playlist" });
    } else {
      playlist.videos.splice(videoIndex, 1);
      await playlist.save();
      const userRes = await User.findById(userId).populate({
        path: "playlists",
        populate: {
          path: "videos",
          model: "Video", // optional
          populate: [{ path: "creator" }, { path: "category" }],
        },
      });
      const playlists = userRes.playlists;

      const formatterPlaylists = playlists.map((playlist) => ({
        _id: playlist._id,
        name: playlist.name,
        videos: getVideoInFormat({ videos: playlist.videos }),
      }));

      return res.json({
        message: "Video removed from playlist successfully",
        playlists: formatterPlaylists,
      });
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
  getPlaylistById,
  removePlaylistById,
};

module.exports = playlistController;
