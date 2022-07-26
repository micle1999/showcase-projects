const EventController = require("../../controllers/eventController");

const RewardController = require("../../controllers/rewardController");

const express = require("express");

let router = express.Router();

const bodyParser = require("body-parser");

const auth = require("../../middleware/authorization");

const validator = require("../../middleware/validation/validationHandler");

const validationRequest = validator();

const limiter = require("../../middleware/limiters")

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/specific/:eventId" , validationRequest ,auth.authorize_u, EventController.getEvent);

router.get("/all" , auth.authorize_u, EventController.getAllEvents);

router.get("/active" , auth.authorize_u, EventController.getActiveEvents);

router.post("/finish/:eventId" , validationRequest ,auth.authorize_a, EventController.finishEvent);

router.post("/reviewing/:eventId" , validationRequest ,auth.authorize_a, EventController.reviewingEvent);

router.post("/" , validationRequest , auth.authorize_a, EventController.createEvent , RewardController.createRewards , limiter.createObjectLimiter);

router.delete("/:eventId" , auth.authorize_a, EventController.deleteEvent);

module.exports = router;
