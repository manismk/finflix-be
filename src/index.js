const express = require("express");
const dotenv = require("dotenv");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const userAuthenticateMiddleware = require("./middleware/userAuthenticateMiddleware");
const userAdminAuthMiddleware = require("./middleware/userAdminAuthMiddleware");
const categoryRoutes = require("./routes/categoryRoutes");
const creatorRoutes = require("./routes/creatorRoutes");

dotenv?.config();
const PORT = process.env.PORT;
const MONGO_DB_URL = process.env.MONGO_DB_URL;
mongoose.connect(MONGO_DB_URL);

// Middleware to parse body
app.use(express.json());

// Unauthenticated Routes
app.use("/auth", authRoutes);

// User Authenticated Routes
app.use(userAuthenticateMiddleware);
app.get("/", (req, res) => {
  res.send("Hello Finflix!");
});

// Admin Routes
app.use(userAdminAuthMiddleware);
app.use("/category", categoryRoutes);
app.use("/creator", creatorRoutes);

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
