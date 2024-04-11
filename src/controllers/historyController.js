const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");

const addToHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const video_id = req.params.videoId;

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

    const videoIndex = user.history.indexOf(video_id);
    if (videoIndex === -1) {
      user.history.unshift(video_id);
    } else {
      user.history.splice(videoIndex, 1);
      user.history.unshift(video_id);
    }
    await user.save();
    return res
      .status(200)
      .json({ message: "Video added to history successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const removeFromHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const video_id = req.params.videoId;

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

    const index = user.history.indexOf(video_id);
    if (index !== -1) {
      user.history.splice(index, 1);
      await user.save();
      res.json({ message: "Video removed from history" });
    } else {
      return res.status(400).json({ error: "Video is not in history" });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(411).json({ error: "Invalid user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const videoIds = user.history;

    const videos = await Video.find({ _id: { $in: videoIds } })
      .populate("category")
      .populate("creator");

    const sortedVideos = videoIds.map((videoId) =>
      videos.find((video) => String(video._id) === String(videoId))
    );
    const formattedVideos = sortedVideos.map((video) => ({
      _id: video._id,
      title: video.title,
      creator: video.creator.name,
      creatorImgUrl: video.creator.img_url,
      description: video.description,
      duration: video.duration,
      category: video.category.name,
    }));

    res.status(200).json(formattedVideos);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(411).json({ error: "Invalid user id" });
    }

    const user = await User.findById(userId).populate("history");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.history = [];
    user.save();
    res.status(200).json({ message: "History cleared" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const historyController = {
  addToHistory,
  removeFromHistory,
  getAllHistory,
  clearHistory,
};

module.exports = historyController;
