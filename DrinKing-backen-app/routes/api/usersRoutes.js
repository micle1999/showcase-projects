const UserController = require("../../controllers/userController");

const validator = require("../../middleware/validation/validationHandler");

const validateRequest = validator();

const auth = require("../../middleware/authorization");

const express = require("express");

let router = express.Router();

const limiter = require("../../middleware/limiters")

const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post("/register" ,validateRequest , UserController.register , limiter.createAccountLimiter);

router.post("/login", validateRequest , UserController.login);

router.post("/refresh", validateRequest, auth.refreshToken);

router.post("/confirmation/resend",validateRequest, UserController.resendConfirmationEmail);

router.post("/resetPassword/send/:email",validateRequest, UserController.resetPasswordEmail);

router.post("/resetPassword/:token",validateRequest, UserController.resetPassword);

router.post("/ban/:userId",auth.authorize_a, UserController.setBanStatus);

router.get("/confirmation/:token",validateRequest, UserController.confirmEmail);

router.get("/prizes", auth.authorize_u , UserController.getPrizes);

router.get("/all", auth.authorize_a , UserController.getAllUsers);

module.exports = router;
