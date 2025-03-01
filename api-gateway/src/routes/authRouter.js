const router = require("express").Router();
const authController = require("../controllers/authController");
const { loginRateLimiter } = require("../middlewares/rateLimit");
const verifyToken = require("../middlewares/verifyTokenMiddleware");

router.post("/register", authController.register);
router.post("/login", loginRateLimiter, authController.login);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
