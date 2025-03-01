const router = require("express").Router();
const authController = require("../controllers/authController");
const { loginRateLimiter } = require("../middlewares/rateLimit");
const verifyToken = require("../middlewares/verifyTokenMiddleware");
const verifyUserDeletion = require("../middlewares/verifyUserDeletion");

router.post("/register", authController.register);
router.post("/login", loginRateLimiter, authController.login);
router.post("/logout", verifyToken, authController.logout);
router.delete(
  "/delete/:user_id",
  verifyToken,
  verifyUserDeletion,
  authController.deleteUser
);

module.exports = router;
