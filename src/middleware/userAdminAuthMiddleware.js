const User = require("../models/User");

const userAdminAuthMiddleware = async (req, res, next) => {
  const user = req?.user;

  if (!user || !user.username) {
    return res
      .status(401)
      .json({ message: "Unauthorized - Admin access missing" });
  }

  try {
    const userData = await User.findOne({ username: user?.username });
    if (!userData || !userData.is_admin) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Admin access required" });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = userAdminAuthMiddleware;
