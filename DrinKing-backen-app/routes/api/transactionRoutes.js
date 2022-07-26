const transactionController = require("../../controllers/transactionController");

const auth = require("../../middleware/authorization");

const limiter = require("../../middleware/limiters");

const validator = require("../../middleware/validation/validationHandler");

const validationRequest = validator();

const express = require("express");

let router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/bar/active", auth.authorize_b ,transactionController.getActivatedTransactions);

router.get("/bar/all", auth.authorize_b ,transactionController.getAllTransactionsInBar);

router.get("/user/active", auth.authorize_u ,transactionController.getActivatedTransactionForUser);

router.post("/", validationRequest, auth.authorize_u ,transactionController.createTransaction);

//router.post("/validate/:transactionId", validationRequest, auth.authorize_b,  transactionController.validateTransaction);

router.delete("/delete/:transactionId", validationRequest, auth.authorize_u ,transactionController.deleteTransaction);

//TODO transaction cleaner (delete all transactions older than 3 months) -> triggers mongodb

module.exports = router;
