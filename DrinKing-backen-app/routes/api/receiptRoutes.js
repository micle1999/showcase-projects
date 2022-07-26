const ReceiptController = require("../../controllers/receiptController");

const express = require("express");

let router = express.Router();

const bodyParser = require("body-parser");

const auth = require("../../middleware/authorization");

const validator = require("../../middleware/validation/validationHandler");

const validationRequest = validator();

const limiter = require("../../middleware/limiters")

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/user/event/:eventId" , validationRequest, auth.authorize_u, ReceiptController.getReceiptsForUserInEvent);

router.get("/admin/event/:eventId" , validationRequest, auth.authorize_a, ReceiptController.getReceiptsForEvent);

router.post("/" , validationRequest, auth.authorize_u, ReceiptController.addReceipt);

router.post("/approve/:receiptId" , validationRequest ,auth.authorize_a, ReceiptController.approveReceipt);

router.post("/reject/:receiptId" , validationRequest , auth.authorize_a, ReceiptController.rejectReceipt);

module.exports = router;
