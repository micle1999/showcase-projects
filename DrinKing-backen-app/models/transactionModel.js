mongoose = require("mongoose");
const crypto = require("crypto");

const transactionSchema = new mongoose.Schema({
  code: mongoose.Schema.Types.String,
  value: mongoose.Schema.Types.Number,
  validated: mongoose.Schema.Types.Boolean,
  expiration_date: mongoose.Schema.Types.Number,
  user_id: mongoose.Schema.Types.ObjectId,
  bar_id: mongoose.Schema.Types.ObjectId,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports.createTransaction = (transactionData) => {
  const completedData = completeTransactionData(transactionData);
  const transaction = new Transaction(completedData);
  return transaction.save();
};

module.exports.getTransaction = (transactionId) => {
  return Transaction.findOne({ _id: transactionId }).lean().exec();
};

module.exports.validateTransaction = (transactionId) => {
  return Transaction.findOneAndUpdate(
    { _id: transactionId },
    { validated: true }
  ).exec();
};

module.exports.deleteTransaction = (transactionId) => {
  return Transaction.findOneAndDelete({ _id: transactionId }).lean().exec();
};

module.exports.getActiveTransactionsInBar = (barId) => {
  return Transaction.find({
    bar_id: barId,
    validated: false,
    expiration_date: { $gte: Date.now() },
  }).lean().exec();
};

module.exports.getActiveTransactionForUser = (userId) => {
  return Transaction.findOne({
    user_id: userId,
    validated: false,
    expiration_date: { $gte: Date.now() },
  }).lean().exec();
};

module.exports.getAllTransactionsForUser = (userId) => {
  return Transaction.find({
    user_id: userId
  }).lean().exec();
}

module.exports.getPastTransactionsInBar = (barId) => {
  return Transaction.find({
    bar_id: barId, validated: true
  }).lean().exec();
}

module.exports.getActiveTransactions = () => {
  return Transaction.find({
    validated: false,
    expiration_date: { $gte: Date.now() },
  }).lean().exec();
}

module.exports.getAllPastTransactions = () => {
  return Transaction.find({validated: true}).lean().exec();
}

module.exports.insertMany = (data) => {
  return Transaction.insertMany(data);
}

module.exports.deleteAll = () => {
  return Transaction.deleteMany({}).exec();
}

module.exports.Transaction = {
  Transaction: Transaction,
};

function completeTransactionData(transactionData) {
  let expDate = new Date();
  expDate.setMinutes(expDate.getMinutes() + 1);
  transactionData.code = crypto.randomBytes(8).toString("hex");
  transactionData.validated = false;
  transactionData.expiration_date = expDate.getTime();
  return transactionData;
}
