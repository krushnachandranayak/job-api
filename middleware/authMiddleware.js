// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Employer = require("../models/Employer");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      if (!decode) {
        return res.status(401).json({ message: "Invalid token" });  //verify token
      }

      const employer = await Employer.findById(decode.id).select("-password");
      if (!employer || !employer.isAuthorized) {
        return res.status(403).json({ message: "You are not authorized" }); //check employer
      }
      req.user = employer;
      return next();
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }
  res.status(401).json({ message: "There is no token found !" });  //no token
};

module.exports = { authenticateToken };
