const ReceiptModel = require("../models/receiptModel");
const EventModel = require("../models/eventModel");
const UserModel = require("../models/userModel");
const EventController = require("../controllers/eventController");
const EVENT_STATUS = require("../enums").EVENT_STATUS;
const EMAIL_TYPE = require("../enums").EMAIL_TYPE;
const RECEIPT_STATUS = require("../enums").RECEIPT_STATUS;
const receiptsBucketName = process.env["AWS_RECEIPTS_BUCKET"];
const sender = require("../notifications/emailSender");
const s3 = require("../s3/s3");

module.exports.approveReceipt = async (req, res) => {
  ReceiptModel.getReceiptById(req.params.receiptId).then(async (receipt) => {
    if (receipt != null) {
      const realIdDuplicity = await checkIdDuplicity(receipt._id, req.body.realReceiptId);
      if (receipt.status !== RECEIPT_STATUS.APPROVED && !realIdDuplicity) {
        ReceiptModel.approve(
          req.params.receiptId,
          req.body.value,
          req.body.realReceiptId
        )
          .then(async (result) => {
            await EventController.addScoreToParticipant(
              result.event_id,
              result.user_id,
              req.body.value
            );
            res.status(200).send();
            const user = await UserModel.findByUserId(result.user_id);
            const emailData = {
              receiptId: req.params.receiptId,
              receiptValue: req.body.value,
              username: user.username,
              eventName: await EventModel.getEventName(result.event_id)
            }
            sender.sendEmail(user.email, emailData, EMAIL_TYPE.RECEIPT_VALIDATED).catch(err => {console.log(err)});
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send();
          });
      } else
        res
          .status(400)
          .send("Receipt is already approved or receipt is duplicated.");
    } else res.status(404).send();
  });
};

module.exports.rejectReceipt = (req, res) => {
  ReceiptModel.getReceiptById(req.params.receiptId).then((receipt) => {
    if (receipt != null) {
      if (receipt.status !== RECEIPT_STATUS.REJECTED) {
        ReceiptModel.reject(req.params.receiptId)
          .then(async (result) => {
            await EventController.subtractScoreOfParticipant(
                result.event_id,
                result.user_id,
                req.body.value
            );
            res.status(200).send();
            const user = await UserModel.findByUserId(result.user_id);
            const emailData = {
              receiptId: req.params.receiptId,
              username: user.username,
              eventName: await EventModel.getEventName(result.event_id)
            }
            sender.sendEmail(user.email, emailData, EMAIL_TYPE.RECEIPT_VALIDATED).catch(err => {console.log(err)});
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send();
          });
      } else res.status(400).send("Receipt already rejected.");
    } else res.status(404).send("Receipt not found.");
  });
};

module.exports.addReceipt = (req, res) => {
  EventModel.getEvent(req.body.event_id).then(async (event) => {
    console.log(req.body);
    if (!!event) {
      if (event.state === EVENT_STATUS.ONGOING) {
        ReceiptModel.createReceipt(req.body)
          .then((receipt) => {
            s3.upload(
              req.body.image,
              receipt._id.toString(),
              req.body.type,
              receiptsBucketName
            )
              .then((result) => {
                res.status(201).send();
              })
              .catch((err) => {
                console.log(err);
                res.status(500).send("Failed To Upload Receipt On AWS.");
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send("Receipt Creation In DB Failed.");
          });
      } else res.status(403).send("You Cannot add Receipt To Inactive Event.");
    } else res.status(404).send("No Event With This ID Found.");
  });
};

module.exports.getReceiptsForUserInEvent = (req, res) => {
  ReceiptModel.getReceiptsForUserInEvent(
    req.body.user_id,
    req.params.eventId
  ).then((receipts) => {
    if (!!receipts) {
      for (let receipt of receipts) {
        receipt.image = s3.getSignedUrl(
          receipt._id.toString(),
          receiptsBucketName,
            true
        );
      }
      res.status(200).send(receipts);
    } else res.status(404).send("No Receipts For Current User In This Event.");
  });
};

module.exports.getReceiptsForEvent = (req, res) => {
  ReceiptModel.getReceiptsForEvent(req.params.eventId).then((receipts) => {
    if (!!receipts) {
      for (let receipt of receipts) {
          receipt.image = s3.getSignedUrl(
          receipt._id.toString(),
          receiptsBucketName,
            true
        );
      }
      res.status(200).send(receipts);
    } else res.status(404).send("No Receipts For Current Event.");
  });
};

async function checkIdDuplicity(receiptId, realReceiptId) {
  const receipt = await ReceiptModel.getReceiptByRealId(receiptId, realReceiptId);
  return receipt != null;
}
