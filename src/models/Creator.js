const mongoose = require("mongoose");

const creatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  img_url: { type: String, required: true },
});

const Creator = mongoose.model("Creator", creatorSchema);

module.exports = Creator;
