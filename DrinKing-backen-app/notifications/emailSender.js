const userController = require("../controllers/userController");
const emailCreator = require("./emailCreator");
const SES = require("aws-sdk/clients/ses");
const region = process.env["AWS_REGION"];
const access = process.env["AWS_ACCESS_KEY_ID"];
const secret = process.env["AWS_SECRET_ACCESS_KEY"];

const ses = new SES();

ses.config.update({
    region: region,
    accessKeyId: access,
    secretAccessKey: secret,
    signatureVersion: "v4",
});

module.exports.sendEmail = (receiver , data , type) => {
    const params = emailCreator.create(type , data , [receiver]);
    return ses.sendTemplatedEmail(params).promise();
}

module.exports.sendBulkEmail = (listOfReceivers , data , type) => {
    const params = emailCreator.create(type , data, listOfReceivers)
    return ses.sendTemplatedEmail(params).promise();
}

module.exports.sendBulkEmailToAll = async(data , type) => {
    const emails = await userController.getEmailsOfAllUsers();
    console.log("EMAILS:" + JSON.stringify(emails));
    const params = emailCreator.create(type , data, emails)
    return ses.sendTemplatedEmail(params).promise();
}


//TODO add emails of all tested subjects to aws
