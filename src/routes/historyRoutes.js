const express = require("express");
const historyController = require("../controllers/historyController");
const router = express.Router();

router.get("/history", historyController.getAllHistory);
router.delete("/history", historyController.clearHistory);
router.post("/history/:videoId", historyController.addToHistory);
router.delete("/history/:videoId", historyController.removeFromHistory);

const historyRoutes = router;

module.exports = historyRoutes;
