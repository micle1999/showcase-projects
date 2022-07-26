const ProfileController = require("../../controllers/profileController");

const express = require("express");

let router = express.Router();

const bodyParser = require("body-parser");

const auth = require("../../middleware/authorization");

const validator = require("../../middleware/validation/validationHandler");

const validationRequest = validator();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post("/changePhoto" , auth.authorize_u , ProfileController.changeUserPhoto);

router.get("/getPhoto" , auth.authorize_u ,ProfileController.getUserPhoto);

router.get("/specific" , auth.authorize_u ,ProfileController.getUserProfile);

router.delete("/deletePhoto" , auth.authorize_u ,ProfileController.deleteUserPhoto);

//router.post("/changeData" , validationRequest , auth.authorize_u , ProfileController.changeUserData);

router.post("/changePassword" , validationRequest , auth.authorize_u , ProfileController.changeUserPassword);

router.delete("/deleteAccount" , validationRequest , auth.authorize_u , ProfileController.deleteAccount);

module.exports = router;
