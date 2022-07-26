const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  token: mongoose.Schema.Types.String,
  expires: mongoose.Schema.Types.Number,
  created: {
    type: mongoose.Schema.Types.Number,
    default: Date.now,
  },
});

module.exports.createRefreshToken = async (tokenData) => {
  const refreshToken = new RefreshToken(tokenData);
  refreshToken.expires = tokenData.expires;
  return refreshToken.save();
};

module.exports.isExpired = (token) => {
  return Date.now() >= token.expires;
};

module.exports.findByUserId = (userId) => {
  return RefreshToken.findOne({user_id : userId}).lean().exec();
}

module.exports.findToken = (token) => {
  return RefreshToken.findOne({token: token}).lean().exec();
}

module.exports.deleteToken = (token) => {
  return RefreshToken.deleteOne({token : token.token}).exec()
}

module.exports.deleteTokenByUserId = (userId) => {
  return RefreshToken.deleteOne({user_id : userId}).exec()
}

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports.RefreshToken = {
  RefreshToken: RefreshToken
};
