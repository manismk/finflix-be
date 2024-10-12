const mongoose = require("mongoose");
const User = require("../models/User");
const Video = require("../models/Video");
const { getVideoInFormat } = require("../utils/getVideoInFormat");

const likeVideo = async (req, res) => {
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

    if (!user?.likedVideos?.includes(video_id)) {
      user?.likedVideos?.push(video_id);
      await user.save();
      const videoIds = user.likedVideos;

      const videos = await Video.find({ _id: { $in: videoIds } })
        .populate("category")
        .populate("creator");
      const formattedVideos = getVideoInFormat({ videos });
      res.status(201).json({
        message: "Video liked successfully",
        likes: formattedVideos,
      });
    } else {
      return res.status(400).json({ error: "Video already liked by the user" });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const disLikeVideo = async (req, res) => {
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

    const index = user.likedVideos.indexOf(video_id);
    if (index !== -1) {
      user.likedVideos.splice(index, 1);
      await user.save();
      const videoIds = user.likedVideos;

      const videos = await Video.find({ _id: { $in: videoIds } })
        .populate("category")
        .populate("creator");
      const formattedVideos = getVideoInFormat({ videos });
      res.json({
        message: "Video disliked successfully",
        likes: formattedVideos,
      });
    } else {
      return res.status(400).json({ error: "User didn't like the video" });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllLikedVideos = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(411).json({ error: "Invalid user id" });
    }

    const user = await User.findById(userId).populate("likedVideos");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const videoIds = user.likedVideos;

    const videos = await Video.find({ _id: { $in: videoIds } })
      .populate("category")
      .populate("creator");
    const formattedVideos = getVideoInFormat({ videos });

    res.status(200).json(formattedVideos);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const likeContoller = { likeVideo, disLikeVideo, getAllLikedVideos };

module.exports = likeContoller;
