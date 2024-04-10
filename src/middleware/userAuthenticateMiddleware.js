const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const userAuthenticateMiddleware = (req, res, next) => {
  const authToken = req.header("Authorization");

  if (!authToken) {
    return res.status(401).json({ message: "Unauthorized - Missing token" });
  }

  try {
    const decoded = jwt.verify(authToken, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = userAuthenticateMiddleware;
