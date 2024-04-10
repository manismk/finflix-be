const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  _id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  creator: { type: Schema.Types.ObjectId, ref: "Creator" },
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
