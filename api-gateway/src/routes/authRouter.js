const router = require("express").Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/verifyTokenMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", verifyToken, authController.logout);
router.get("/user", verifyToken, authController.user);

module.exports = router;
