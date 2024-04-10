const mongoose = require("mongoose");
const zod = require("zod");
const Creator = require("../models/Creator");

// Input Validation
const createCreatorSchema = zod.object({
  name: zod.string().min(3),
  img_url: zod.string().url(),
});

const createCreator = async (req, res) => {
  try {
    const zodResponse = createCreatorSchema.safeParse(req.body);
    const { name, img_url } = zodResponse.data;

    const existingCreator = await Creator.findOne({ name });
    if (existingCreator) {
      return res.status(400).json({ error: "Creator already exists" });
    }

    const newCreator = new Creator({ name, img_url });
    const savedCreator = await newCreator.save();

    res.status(201).json(savedCreator);
  } catch (error) {
    console.error(error);
    res
      .status(411)
      .json({ message: "Invalid user data", errors: error.errors });
  }
};

const getAllCreators = async (req, res) => {
  try {
    const allCreators = await Creator.find();
    res.status(200).json(allCreators);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getCreatorById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Creator ID" });
    }
    const creator = await Creator.findById(req.params.id);
    if (!creator) {
      return res.status(404).json({ error: "Creator not found" });
    }
    res.status(200).json(creator);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateCreator = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Creator ID" });
    }
    const zodResponse = createCreatorSchema.safeParse(req.body);
    const { name, img_url } = zodResponse.data;
    const updatedCreator = await Creator.findByIdAndUpdate(
      req.params.id,
      { name, img_url },
      { new: true }
    );
    if (!updatedCreator) {
      return res.status(404).json({ error: "Creator not found" });
    }
    res.status(200).json(updatedCreator);
  } catch (error) {
    console.error(error);
    res
      .status(411)
      .json({ message: "Invalid user data", errors: error.errors });
  }
};

const creatorController = {
  createCreator,
  getAllCreators,
  getCreatorById,
  updateCreator,
};

module.exports = creatorController;
