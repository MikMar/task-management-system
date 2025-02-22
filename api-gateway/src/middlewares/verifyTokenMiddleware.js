const authClient = require("../clients/authClient");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json("A token is required for authentication");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json("A token is required for authentication");
  }

  // Make a gRPC call to the auth service to verify the token
  authClient.VerifyToken({ token: token }, (error, response) => {
    if (error) {
      return res.status(401).json({ error: error.details || "Invalid Token" });
    }

    if (!response || !response.valid) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    req.user = { id: response.userId };
    return next();
  });
};

module.exports = verifyToken;
