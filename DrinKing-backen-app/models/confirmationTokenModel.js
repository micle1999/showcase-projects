const mongoose = require("mongoose");

const confirmationTokenSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    user_email: mongoose.Schema.Types.String,
    token: mongoose.Schema.Types.String,
    created: {
        type: mongoose.Schema.Types.Number,
        default: Date.now,
    },
});

module.exports.createConfirmationToken = async (tokenData) => {
    const confirmationToken = new ConfirmationToken(tokenData);
    return confirmationToken.save();
};

module.exports.findByUserId = (userId) => {
    return ConfirmationToken.findOne({user_id: userId}).lean().exec();
}

module.exports.findByEmail = (email) => {
    return ConfirmationToken.findOne({user_email: email}).lean().exec();
}

module.exports.findToken = (token) => {
    return ConfirmationToken.findOne({token: token}).lean().exec();
}

module.exports.deleteToken = (token) => {
    return ConfirmationToken.deleteOne({token : token})
}

module.exports.deleteTokenByEmail = (email) => {
    return ConfirmationToken.deleteOne({user_email : email})
}

const ConfirmationToken = mongoose.model("ConfirmationToken", confirmationTokenSchema);

module.exports.ConfirmationToken = {
    ConfirmationToken: ConfirmationToken
};
