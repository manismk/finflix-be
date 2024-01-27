const express = require("express");
const dotenv = require("dotenv");
const app = express();
dotenv?.config();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello Finflix!");
});

// Middleware to parse body
app.use(express.json());

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
