const ROLES = require("../enums").ROLES;
mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: mongoose.Schema.Types.String,
  password: mongoose.Schema.Types.String,
  email: mongoose.Schema.Types.String,
  role: mongoose.Schema.Types.String,
  active: mongoose.Schema.Types.Boolean,
  profile_image: mongoose.Schema.Types.Boolean,
  banned: mongoose.Schema.Types.Boolean,
  trophies: {
    gold: mongoose.Schema.Types.Number,
    silver: mongoose.Schema.Types.Number,
    bronze: mongoose.Schema.Types.Number,
  },
  prizes: [
    {
      bar_id: mongoose.Schema.Types.ObjectId,
      credit: mongoose.Schema.Types.Number,
    },
  ],
  events: [mongoose.Schema.Types.ObjectId],
  total_events_no: mongoose.Schema.Types.Number,
  total_credits_gained: mongoose.Schema.Types.Number,
  best_score: mongoose.Schema.Types.Number,
});

//CRUD Operations

const User = mongoose.model("User", userSchema);

module.exports.createUserAccount = async (userData) => {
  const completedData = await completeUserAccountData(userData);
  const user = new User(completedData);
  return user.save();
};

module.exports.createAdminAccount = async (userData) => {
  const completedData = await completeAdminAccountData(userData);
  const user = new User(completedData);
  return user.save();
};

module.exports.createBarAccount = async (userData) => {
  const completedData = await completeBarAccountData(userData);
  const user = new User(completedData);
  return user.save();
};

module.exports.getUsers = (userIds) => {
  return User.find({ _id: { $in: userIds } })
    .lean()
    .exec();
};

module.exports.findAllUsers = () => {
  return User.find().lean().exec();
};

module.exports.findByUsername = (username) => {
  return User.findOne({ username: username }).lean().exec();
};

module.exports.findByEmail = (email) => {
  return User.findOne({ email: email }).lean().exec();
};

module.exports.findByUserId = (userId) => {
  return User.findOne({ _id: userId }).lean().exec();
};

module.exports.updateUserData = (user) => {
  return User.findOneAndUpdate(
    { username: user.username },
    { email: user.email, birth_date: user.birthDate }
  ).exec();
};

module.exports.deleteUser = (username) => {
  return User.findOneAndDelete({ username: username }).exec();
};

module.exports.updateUserPassword = (userId, password) => {
  return User.findOneAndUpdate(
    { _id: userId },
    { password: password }
  ).exec();
};

module.exports.getBarCreditValueByUsername = (username, barId) => {
  return User.findOne({ username: username })
    .select({ prizes: { $elemMatch: { barId: barId } } })
    .exec();
};

module.exports.getBarCreditValueById = (userId, barId) => {
  return User.findOne({ _id: userId })
    .select({ prizes: { $elemMatch: { bar_id: barId } } })
    .exec();
};

module.exports.addNewPrize = (userId, credit, barId) => {
  return User.findOneAndUpdate(
    { _id: userId },
    { $push: { prizes: { bar_id: barId, credit: credit } } }
  ).exec();
};

module.exports.addExistingPrize = (userId, credit, barId) => {
  return User.findOneAndUpdate(
    { _id: userId, prizes: { $elemMatch: { bar_id: barId } } },
    { $inc: { "prizes.$.credit": credit } }
  ).exec();
};

module.exports.utilizeCredits = (userId, barId, value) => {
  return User.findOneAndUpdate(
    { _id: userId, prizes: { $elemMatch: { bar_id: barId } } },
      { $inc: { "prizes.$.credit": -value } }
  ).exec();
};

module.exports.incrementTotalEvents = (userId) => {
  return User.findOneAndUpdate(
    { _id: userId },
    { $inc: { total_events_no: 1 } }
  ).exec();
};

module.exports.decrementTotalEvents = (userId) => {
  return User.findOneAndUpdate(
      { _id: userId },
      { $inc: { total_events_no: -1 } }
  ).exec();
};

module.exports.setBestScore = (userId, score) => {
  return User.findOneAndUpdate({ _id: userId }, { best_score: score }).exec();
};

module.exports.incrementCreditsGained = (userId, credits) => {
  return User.findOneAndUpdate(
    { _id: userId },
    { $inc: { total_credits_gained: credits } }
  ).exec();
};

module.exports.addTrophy = (userId, trophy) => {
  return User.findOneAndUpdate({ _id: userId},
      { trophies : {$inc: { trophy : 1 } } }).exec()
};

module.exports.getEmailsOfAllUsers = () => {
  return User.find({role : ROLES.USER}).select('email').exec();
}

module.exports.getEmailDataForUsers = (eventId) => {
  return User.find({role : ROLES.USER , events: { $elemMatch: {eventId}}}).select('_id email username').lean().exec();
}

module.exports.activateAccount = (userId) => {
  return User.findOneAndUpdate({_id : userId } , {active : true}).lean().exec();
}

module.exports.setBanStatus = (userId, banStatus) => {
  return User.findOneAndUpdate({_id: userId} , {banned : banStatus}).exec();
}

module.exports.changeProfileImage = (userId, state) => {
  return User.findOneAndUpdate({_id: userId} , {profile_image : state}).exec();
}

module.exports.insertMany = (data) => {
  return User.insertMany(data);
}

module.exports.deleteAll = () => {
  return User.deleteMany({}).exec();
}


async function completeUserAccountData(userData) {
  const salt = await bcrypt.genSalt();
  userData.password = await bcrypt.hash(userData.password, salt);
  userData.role = ROLES.USER;
  userData.profile_image = false;
  userData.trophies = { gold: 0, silver: 0, bronze: 0 };
  userData.total_events_no = 0;
  userData.best_score = 0;
  userData.total_credits_gained = 0;
  userData.active = false;
  userData.banned = false;
  return userData;
}

async function completeAdminAccountData(userData) {
  const salt = await bcrypt.genSalt();
  userData.password = await bcrypt.hash(userData.password, salt);
  userData.role = ROLES.ADMIN;
  userData.profile_image = false;
  userData.trophies = { gold: 0, silver: 0, bronze: 0 };
  userData.active = true;
  return userData;
}

async function completeBarAccountData(barData) {
  const salt = await bcrypt.genSalt();
  barData.password = await bcrypt.hash(barData.password, salt);
  barData.role = ROLES.BAR;
  barData.profile_image = false;
  barData.trophies = null;
  barData.active = true;
  barData.banned = false;
  return barData;
}

module.exports.User = {
  User: User,
};
