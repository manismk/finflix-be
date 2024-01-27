const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signUpUser);
router.post("/login", authController.loginUser);
router.post("/admin-signup", authController.signUpAdmin);

const authRoutes = router;

module.exports = authRoutes;
