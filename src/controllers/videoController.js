const mongoose = require("mongoose");
const zod = require("zod");
const Video = require("../models/Video");
const Creator = require("../models/Creator");
const Category = require("../models/category");

// Input Validation
const createVideoSchema = zod.object({
  id: zod.string().min(3),
  title: zod.string().min(3),
  description: zod.string().min(3),
  duration: zod.string().min(3),
});

const updateVideoSchema = zod.object({
  title: zod.string().min(3).optional(),
  description: zod.string().min(3).optional(),
  duration: zod.string().min(3).optional(),
});

const createVideo = async (req, res) => {
  try {
    const { creator_id, category_id } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(creator_id) ||
      !mongoose.Types.ObjectId.isValid(category_id)
    ) {
      return res.status(411).json({ message: "Invalid user data" });
    }
    const zodResponse = createVideoSchema.safeParse(req.body);
    const { id, title, description, duration } = zodResponse.data;

    const existingCreator = await Creator.findById(creator_id);
    if (!existingCreator) {
      return res.status(400).json({ error: "Creator not found" });
    }
    const existingCategory = await Category.findById(category_id);
    if (!existingCategory) {
      return res.status(400).json({ error: "Category not found" });
    }
    const existingVideo = await Video.findOne({ _id: id });
    if (existingVideo) {
      return res.status(400).json({ error: "Video already exists" });
    }

    const newVideo = new Video({
      _id: id,
      title,
      description,
      duration,
      creator: creator_id,
      category: category_id,
    });
    const savedVideo = newVideo.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    console.error(error);
    res
      .status(411)
      .json({ message: "Invalid user data", errors: error.errors });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("creator").populate("category");
    const formattedVideos = videos.map((video) => ({
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

const getVideoById = async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate("creator")
    .populate("category");
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }
  const formattedVideo = {
    _id: video._id,
    title: video.title,
    creator: video.creator.name,
    creatorImgUrl: video.creator.img_url,
    description: video.description,
    duration: video.duration,
    category: video.category.name,
  };
  res.status(200).json(formattedVideo);
  try {
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { creator_id, category_id } = req.body;
    if (creator_id && category_id) {
      if (
        !mongoose.Types.ObjectId.isValid(creator_id) ||
        !mongoose.Types.ObjectId.isValid(category_id)
      ) {
        return res.status(411).json({ message: "Invalid user data" });
      }
      const existingCreator = await Creator.findById(creator_id);
      if (!existingCreator) {
        return res.status(400).json({ error: "Creator not found" });
      }
      const existingCategory = await Category.findById(category_id);
      if (!existingCategory) {
        return res.status(400).json({ error: "Category not found" });
      }
    }
    const zodResponse = updateVideoSchema.safeParse(req.body);
    const { title, description, duration } = zodResponse.data;

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        duration,
        creator: creator_id,
        category: category_id,
      },
      { new: true }
    );
    res.status(201).json(updatedVideo);
  } catch (error) {
    console.error(error);
    res
      .status(411)
      .json({ message: "Invalid user data", errors: error.errors });
  }
};

const videoController = {
  createVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
};

module.exports = videoController;
