//Sophia Hussain
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  //get token from httpOnly cookie
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    //verify token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    //continue to route controller
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = requireAuth;
