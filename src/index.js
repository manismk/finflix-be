const express = require("express");
const dotenv = require("dotenv");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const userAuthenticateMiddleware = require("./middleware/userAuthenticateMiddleware");

dotenv?.config();
const PORT = process.env.PORT;
const MONGO_DB_URL = process.env.MONGO_DB_URL;
mongoose.connect(MONGO_DB_URL);

// Middleware to parse body
app.use(express.json());

// Authentication
app.use("/auth", authRoutes);

// Authenticated Routes
app.use(userAuthenticateMiddleware);
app.get("/", (req, res) => {
  res.send("Hello Finflix!");
});

// Global catch, Server errors
app.use((err, req, res, next) => {
  // TODO Move this to logger later
  console.log("err", err);
  res.status(500).json({
    message: "Something is went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
