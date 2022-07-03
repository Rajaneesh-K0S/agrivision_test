const { Router } = require("express");
const router = Router();
const passport = require("passport");
const { uploadImg } = require("../../../config/imageUpload");

const {
	registerUser,
	login,
	resendMail,
	googleOauth,
	googleOneTapLogin,
	confirmEmail,
	resetPassword,
	forgotPassword,
	getCart,
	deleteProductInCart,
	addToCart,
	getReminder,
	userProgress,
	addReminder,
	getProfile,
	updateProfile,
} = require("../controllers/userController");

router.post("/register", registerUser);

router.post("/login", login);
router.post(
	"/oauth/google",
	passport.authenticate("google-token", { session: false }),
	googleOauth
);
router.post("/oneTapLogin", googleOneTapLogin);
router.get("/resendMail", resendMail);
router.get("/confirmEmail", confirmEmail);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.get(
	"/cart/:id",
	passport.authenticate("jwt", { session: false }),
	getCart
);
router.delete(
	"/cart/:id",
	passport.authenticate("jwt", { session: false }),
	deleteProductInCart
);
router.post(
	"/cart/:id",
	passport.authenticate("jwt", { session: false }),
	addToCart
);
router.get(
	"/profile",
	passport.authenticate("jwt", { session: false }),
	getProfile
);
router.post(
	"/profile",
	passport.authenticate("jwt", { session: false }),
	uploadImg.single("image"),
	updateProfile
);
module.exports = router;
