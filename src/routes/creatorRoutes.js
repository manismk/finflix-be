const express = require("express");
const creatorController = require("../controllers/creatorController");
const router = express.Router();

router.post("/", creatorController.createCreator);
router.get("/all", creatorController.getAllCreators);
router.get("/:id", creatorController.getCreatorById);
router.put("/:id", creatorController.updateCreator);

const creatorRoutes = router;

module.exports = creatorRoutes;
