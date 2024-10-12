const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");
const { getVideoInFormat } = require("../utils/getVideoInFormat");

const addToWatchLaterVideo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { video_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(411).json({ error: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const video = await Video.findById(video_id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    if (!user?.watchLater?.includes(video_id)) {
      user?.watchLater?.push(video_id);
      await user.save();
      const videoIds = user.watchLater;

      const videos = await Video.find({ _id: { $in: videoIds } })
        .populate("category")
        .populate("creator");
      const formattedVideos = getVideoInFormat({ videos: videos });
      res.status(201).json({
        message: "Video added to watch later successfully",
        watchlater: formattedVideos,
      });
    } else {
      return res.status(400).json({ error: "Video already in watch later" });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const removeFromWatchLater = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { video_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(411).json({ error: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const video = await Video.findById(video_id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const index = user.watchLater.indexOf(video_id);
    if (index !== -1) {
      user.watchLater.splice(index, 1);
      await user.save();
      const videoIds = user.watchLater;

      const videos = await Video.find({ _id: { $in: videoIds } })
        .populate("category")
        .populate("creator");
      const formattedVideos = getVideoInFormat({ videos: videos });
      res.json({
        message: "Video removed from Watch later",
        watchlater: formattedVideos,
      });
    } else {
      return res.status(400).json({ error: "Video is not in watch later" });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllWatchLater = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(411).json({ error: "Invalid user id" });
    }

    const user = await User.findById(userId).populate("watchLater");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const videoIds = user.watchLater;

    const videos = await Video.find({ _id: { $in: videoIds } })
      .populate("category")
      .populate("creator");
    const formattedVideos = getVideoInFormat({ videos: videos });

    res.status(200).json(formattedVideos);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const watchLaterController = {
  addToWatchLaterVideo,
  removeFromWatchLater,
  getAllWatchLater,
};

module.exports = watchLaterController;
