//Sophia Hussain
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => { 

  //get authorization header from request
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "No token provided" }); 
  }

  //extract token from "Bearer <token>"
  const token = header.split(" ")[1];

  try {
    //verify token is valid 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //attach decoded user info to request
    next(); //continue to route controller
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
module.exports = requireAuth;
