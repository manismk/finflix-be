const zod = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Input Validation
const passwordSchema = zod
  .string()
  .min(8)
  .regex(/[a-zA-Z]/, {
    message: "Password must contain at least one letter",
  })
  .regex(/[0-9]/, {
    message: "Password must contain at least one number",
  });
const signUpUserSchema = zod.object({
  first_name: zod.string().min(1),
  last_name: zod.string().min(1),
  username: zod.string().email(),
  password: passwordSchema,
});
const signUpAdminSchema = zod.object({
  first_name: zod.string().min(1),
  last_name: zod.string().min(1),
  username: zod.string().email(),
  password: passwordSchema,
  admin_key: zod.literal(process.env.ADMIN_KEY),
});
const loginSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

// User Signup
const signUpUser = async (req, res) => {
  try {
    const zodResponse = signUpUserSchema.safeParse(req.body);
    const { first_name, last_name, username, password } = zodResponse.data;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({
      first_name,
      last_name,
      username,
      password,
      is_admin: false,
    });
    await newUser.save();
    const user = await User.findOne({ username });
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "720h",
      }
    );

    res
      .status(201)
      .json({ message: "User registered successfully", token, user });
  } catch (error) {
    console.error(error);
    res
      .status(411)
      .json({ message: "Invalid user data", errors: error.errors });
  }
};

// Admin Signup
const signUpAdmin = async (req, res) => {
  try {
    const zodResponse = signUpAdminSchema.safeParse(req.body);
    const { first_name, last_name, username, password } = zodResponse.data;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({
      first_name,
      last_name,
      username,
      password,
      is_admin: true,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(411)
      .json({ message: "Invalid user data", errors: error.errors });
  }
};

// User/Admin Login
const loginUser = async (req, res) => {
  try {
    const zodResponse = loginSchema.safeParse(req.body);
    const { username, password } = zodResponse.data;

    // Check if the user exists and the password is correct
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      // TODO Read following article for details session management
      // https://medium.com/hackernoon/all-you-need-to-know-about-user-session-security-ee5245e6bdad
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        JWT_SECRET,
        {
          expiresIn: "720h",
        }
      );

      res.json({ message: "Login successful", token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(411)
      .json({ message: "Invalid user data", errors: error.errors });
  }
};

const authController = {
  signUpUser,
  loginUser,
  signUpAdmin,
};

module.exports = authController;
