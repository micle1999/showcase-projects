const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    user_email: mongoose.Schema.Types.String,
    token: mongoose.Schema.Types.String,
    created: {
        type: mongoose.Schema.Types.Number,
        default: Date.now,
    },
});

module.exports.createResetToken = async (tokenData) => {
    const resetToken = new ResetToken(tokenData);
    return resetToken.save();
};

module.exports.findByUserId = (userId) => {
    return ResetToken.findOne({user_id: userId}).lean().exec();
}

module.exports.findByEmail = (email) => {
    return ResetToken.findOne({user_email: email}).lean().exec();
}

module.exports.findToken = (token) => {
    return ResetToken.findOne({token: token}).lean().exec();
}

module.exports.deleteToken = (token) => {
    return ResetToken.deleteOne({token : token})
}

module.exports.deleteTokenByEmail = (email) => {
    return ResetToken.deleteOne({user_email : email})
}

const ResetToken = mongoose.model("ResetToken", resetTokenSchema);

module.exports.ResetToken = {
    ResetToken: ResetToken
};
