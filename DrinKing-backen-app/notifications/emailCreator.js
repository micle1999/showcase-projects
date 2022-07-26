const source = process.env["AWS_SES_SOURCE_EMAIL"];
const EMAIL_TYPE = require("../enums").EMAIL_TYPE;

let params = {
    Destination: {
        ToAddresses: null // Email address/addresses that you want to send your email
    },
    Template: null,
    TemplateData: null,
    Source: source,
};

module.exports.create = (type , data , emails) => {
    params.Destination.ToAddresses = emails;
    params.Template = type;
    params.TemplateData = getTemplateData(type ,data);
    return params;
}


function getTemplateData(type, data) {
    switch (type) {
        //case EMAIL_TYPE.CONFIRM_ACCOUNT: return '{ \"REPLACEMENT_TAG_NAME\":\"REPLACEMENT_VALUE\" }';
        case EMAIL_TYPE.EVENT_END: return '{ \"username\":\"'+data.username+'\", \"eventName\":\"'+data.eventName+'\",  \"userPoints\":\"'+data.userPoints+'\" }';
        case EMAIL_TYPE.NEW_EVENT: return '{ \"eventName\":\"'+data.eventName+'\", \"barName\":\"'+data.barName+'\", \"startDate\":\"'+data.startDate+'\" }';
        //case EMAIL_TYPE.PASSWORD_RESET: return '{ \"REPLACEMENT_TAG_NAME\":\"REPLACEMENT_VALUE\" }';
        case EMAIL_TYPE.TRANSACTION_CONFIRMED: return '{ \"username\":\"'+data.username+'\", \"transactionId\":\"'+data.transactionId+'\",\"barName\":\"'+data.barName+'\" }';
        case EMAIL_TYPE.RECEIPT_VALIDATED: return '{ \"username\":\"'+data.username+'\", \"receiptId\":\"'+data.receiptId+'\", \"eventName\":\"'+data.eventName+'\",\"receiptValue\":\"'+data.receiptValue+'\" }';
        case EMAIL_TYPE.TRANSACTION_REJECTED: return '{ \"username\":\"'+data.username+'\", \"transactionId\":\"'+data.transactionId+'\",\"barName\":\"'+data.barName+'\" }';
        case EMAIL_TYPE.RECEIPT_REJECTED: return '{ \"username\":\"'+data.username+'\", \"receiptId\":\"'+data.receiptId+'\", \"eventName\":\"'+data.eventName+'\" }';
        //case EMAIL_TYPE.SUCCESSFUL_CONFIRMATION: return '{ \"REPLACEMENT_TAG_NAME\":\"REPLACEMENT_VALUE\" }';
        default: return '{}';
    }
}
