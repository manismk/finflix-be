const express = require("express");
const categoryController = require("../controllers/categoryContoller");
const router = express.Router();

router.post("/", categoryController.createCategory);
router.get("/all", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", categoryController.updateCategory);

const categoryRoutes = router;

module.exports = categoryRoutes;
