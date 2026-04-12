const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => { 

  //get authorization header from request
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "No token provided" }); // ← still 400 here, should be 401
  }

  //extract token from "Bearer <token>"
  const token = header.split(" ")[1];

  try {
    //verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //attach decoded user info to request
    next(); //proceed to route controller
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = requireAuth;

//Completed 12/04/26