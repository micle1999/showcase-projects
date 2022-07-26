const BarController = require("../../controllers/barController");

const UserController = require("../../controllers/userController");

const validator = require("../../middleware/validation/validationHandler");

const validationRequest = validator();

const limiter = require("../../middleware/limiters")

const auth = require("../../middleware/authorization");

const express = require("express");

let router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post("/login" ,validationRequest, auth.authorize_b_login , UserController.login);

router.post("/" , validationRequest , auth.authorize_a , UserController.registerBarUser , BarController.createBar , limiter.createObjectLimiter);

router.get("/specific/:barId" , validationRequest , auth.authorize_b , BarController.getSpecificBar);

router.get("/all" , auth.authorize_b , BarController.getBar);

//router.post("/assignManager" , validationRequest ,auth.authorize_a , BarController.assignManagerToBar);

router.post("/addImage/:barId" , validationRequest , auth.authorize_b , BarController.addImage);

router.put("/deleteImage/:barId" , validationRequest , auth.authorize_b , BarController.deleteImage);

module.exports = router;
