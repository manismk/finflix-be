const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, required: true },
  likedVideos: [{ type: String, ref: "Video" }],
  watchLater: [{ type: String, ref: "Video" }],
  history: [{ type: String, ref: "Video" }],
  playlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
});

// Hash the password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
