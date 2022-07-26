const transactionModel = require("../models/transactionModel");
const userModel = require("../models/userModel");
const barModel = require("../models/barModel");
const scheduler = require("../schedulers/transactionScheduler");
const ROLES = require("../enums").ROLES;

module.exports.createTransaction = (req, res) => {
  userModel
    .findByUserId(req.body.user_id)
    .then(async (user) => {
      const barPrize = user.prizes.find((prize) => {
        return prize.bar_id.toString() === req.body.bar_id.toString();
      });
      if (!!barPrize) {
        if (barPrize.credit >= req.body.value) {
          try {
            const userTransaction =
              await transactionModel.getActiveTransactionForUser(
                req.body.user_id
              );
            if (!userTransaction) {
              const transaction = await transactionModel.createTransaction(
                req.body
              );
              scheduler.scheduleTransactionDeadlineJob(
                transaction._id.toString(),
                transaction.expiration_date
              );
              res.status(201).send(transaction);
            } else
              res.status(409).send("This user has active transaction already.");
          } catch (err) {
            console.log(err);
            res.status(500).send();
          }
        } else
          res.status(409).send("Not enough credits for create transaction.");
      } else res.status(404).send("User has no credits in this bar.");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.validateSocketTransaction = (transactionId) => {
  transactionModel
    .getTransaction(transactionId)
    .then(async (transaction) => {
      await transactionModel.validateTransaction(transaction._id);
      await userModel.utilizeCredits(
        transaction.user_id,
        transaction.bar_id,
        transaction.value
      );
      scheduler.cancelTransactionDeadlineJob(transaction._id.toString());
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.validateTransaction = (req, res) => {
  transactionModel
    .getTransaction(req.params.transactionId)
    .then(async (transaction) => {
      const bar = await barModel.getBar(transaction.bar_id);
      if (req.body.user_id.toString() === bar.manager.toString()) {
        if (Date.now() < transaction.expiration_date) {
          await transactionModel.validateTransaction(transaction._id);
          await userModel.utilizeCredits(
            transaction.user_id,
            transaction.bar_id,
            transaction.value
          );
          scheduler.cancelTransactionDeadlineJob(transaction._id.toString());
          res.status(200).send();
        } else res.status(409).send("Transaction already expired.");
      } else
        res
          .status(401)
          .send("Cannot validate transaction created for another bar.");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.deleteTransaction = (req, res) => {
  transactionModel
    .getTransaction(req.params.transactionId)
    .then(async (transaction) => {
      if (!!transaction) {
        if (req.body.user_id.toString() === transaction.user_id.toString()) {
          if (
            Date.now() >= transaction.expiration_date ||
            !transaction.validated
          ) {
            transactionModel
              .deleteTransaction(req.params.transactionId)
              .then(() => {
                scheduler.cancelTransactionDeadlineJob(transaction._id.toString());
                res.status(200).send();
              });
          } else res.status(403).send("You cannot delete valid transaction.");
        } else
          res
            .status(401)
            .send("Cannot validate transaction created for another bar.");
      } else res.status(404).send("Transaction not found.");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.deleteSocketTransaction = (transactionId) => {
  transactionModel
    .getTransaction(transactionId)
    .then(async (transaction) => {
      if (Date.now() >= transaction.expiration_date || !transaction.validated) {
        transactionModel.deleteTransaction(transactionId).then(() => {
          scheduler.cancelTransactionDeadlineJob(transaction._id.toString());
          console.log(
            "Successfully deleted transaction with id: " + transactionId
          );
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.getActivatedTransactions = async (req, res) => {
  try {
    let transactions = [];
    if (req.body.role === ROLES.ADMIN) {
      transactions = await getAllActivatedTransactions();
    } else if (req.body.role === ROLES.BAR) {
      transactions = await getActiveTransactionsInBar(req.body.user_id);
    }
    console.log("TRANSACTIONS : " + transactions)
    res.status(200).send(transactions);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports.getAllTransactionsInBar = async (req, res) => {
  try {
    let transactions = [];
    if (req.body.role === ROLES.ADMIN) {
      transactions = await getAllPastTransactions();
    } else if (req.body.role === ROLES.BAR) {
      transactions = await getPastTransactionsInBar(req.body.user_id);
    }
    console.log("TRANSACTIONS : " + transactions)
    res.status(200).send(transactions);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports.getActivatedTransactionForUser = (req, res) => {
  transactionModel
    .getActiveTransactionForUser(req.body.user_id)
    .then((transaction) => {
      res.status(200).send(transaction);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

async function getAllActivatedTransactions() {
  return transactionModel.getActiveTransactions().then((transactions) => {
    if(transactions) return transactions;
    return [];
  });
}

async function getAllPastTransactions() {
  return transactionModel.getAllPastTransactions().then((transactions) => {
    if(transactions) return transactions;
    return [];
  });
}

async function getActiveTransactionsInBar(userId) {
  return barModel.getManagedBar(userId).then((bar) => {
    if (!!bar) {
      return transactionModel
        .getActiveTransactionsInBar(bar._id)
        .then((transactions) => {
          if(transactions) return transactions
          return [];
        });
    } else return [];
  });
}

async function getPastTransactionsInBar(userId) {
  return barModel.getManagedBar(userId).then((bar) => {
    if (!!bar) {
      return transactionModel
          .getPastTransactionsInBar(bar._id)
          .then((transactions) => {
            if(transactions) return transactions
            return [];
          });
    } else return [];
  });
}
