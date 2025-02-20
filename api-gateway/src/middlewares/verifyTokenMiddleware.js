const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json("A token is required for authentication");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
