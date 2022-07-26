const CURRENCY = require("../enums").CURRENCY;
const RECEIPT_STATUS = require("../enums").RECEIPT_STATUS;
mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  receipt_id: mongoose.Schema.Types.String,
  event_id: mongoose.Schema.Types.ObjectId,
  creation_date: mongoose.Schema.Types.Number,
  state: mongoose.Schema.Types.String,
  value: mongoose.Schema.Types.Number,
  currency: mongoose.Schema.Types.String,
});

module.exports.createReceipt = (receiptData) => {
  const completedData = completeReceiptData(receiptData);
  const user = new Receipt(completedData);
  return user.save();
};

module.exports.approve = (receiptId, value , realReceiptId) => {
  return Receipt.findOneAndUpdate(
    { _id: receiptId },
    { state: RECEIPT_STATUS.APPROVED, value: value , receipt_id: realReceiptId}
  )
    .lean()
    .exec();
};

module.exports.reject = (receiptId) => {
  return Receipt.findOneAndUpdate(
    { _id: receiptId },
    { state: RECEIPT_STATUS.REJECTED }
  ).exec();
};

module.exports.getReceiptsForUserInEvent = (userId, eventId) => {
  return Receipt.find({ user_id: userId, event_id: eventId }).lean().exec();
};

module.exports.getReceiptsForEvent = (eventId) => {
  return Receipt.find({ event_id: eventId }).lean().exec();
};

module.exports.getReceiptById = (receiptId) => {
  return Receipt.find({ _id: receiptId}).lean().exec();
};

module.exports.getReceiptByRealId = (receiptId, realReceiptId) => {
  return Receipt.findOne({ receipt_id: realReceiptId, _id: { "$ne": receiptId }}).lean().exec();
};

module.exports.insertMany = (data) => {
  return Receipt.insertMany(data);
}

module.exports.deleteAll = () => {
  return Receipt.deleteMany({}).exec();
}

const Receipt = mongoose.model("Receipt", receiptSchema);

function completeReceiptData(receiptData) {
  receiptData.state = RECEIPT_STATUS.PENDING;
  receiptData.creation_date = Date.now();
  receiptData.currency = CURRENCY.CZK;
  return receiptData;
}
