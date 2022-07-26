const ROLES = {
  ADMIN: "admin",
  USER: "user",
  BAR: "bar"
};
Object.freeze(ROLES);

const DUPLICITY_TYPE = {
  USERNAME: "username",
  EMAIL: "email",
  NAME: "name"
};
Object.freeze(DUPLICITY_TYPE);

const EVENT_STATUS = {
    UPCOMING: "upcoming",
    ONGOING: "ongoing",
    REVIEWING:"reviewing",
    FINISHED: "finished"
};
Object.freeze(EVENT_STATUS);

const RECEIPT_STATUS = {
  PENDING: "pending",
  REJECTED: "rejected",
  APPROVED: "approved",
};
Object.freeze(RECEIPT_STATUS);

const TROPHY_TYPE = {
    GOLD: "gold",
    SILVER: "silver",
    BRONZE: "bronze",
    RANDOM: "random"
};
Object.freeze(TROPHY_TYPE);

const DISCOUNT_TYPE = {
    PERCENT: "percent",
    CASH: "cash"
};
Object.freeze(DISCOUNT_TYPE);

const CURRENCY = {
    CZK: "Czk"
};
Object.freeze(CURRENCY);

const EMAIL_TYPE = {
    EVENT_END: "eventend",
    NEW_EVENT: "newevent",
    CONFIRM_ACCOUNT: "confirmaccount",
    SUCCESSFUL_CONFIRMATION : "successfulconfirmation",
    PASSWORD_RESET : "passwordreset",
    TRANSACTION_CONFIRMED : "transactionconfirmed",
    RECEIPT_VALIDATED: "receiptvalidated",
    TRANSACTION_REJECTED : "transactionrejected",
    RECEIPT_REJECTED: "receiptrejected"
}

module.exports.ROLES = ROLES;
module.exports.DUPLICITY_TYPE = DUPLICITY_TYPE;
module.exports.EVENT_STATUS = EVENT_STATUS;
module.exports.RECEIPT_STATUS = RECEIPT_STATUS;
module.exports.TROPHY_TYPE = TROPHY_TYPE;
module.exports.DISCOUNT_TYPE = DISCOUNT_TYPE;
module.exports.CURRENCY = CURRENCY;
module.exports.EMAIL_TYPE = EMAIL_TYPE;
