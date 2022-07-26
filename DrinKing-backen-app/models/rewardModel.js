mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  value: mongoose.Schema.Types.Number,
  discount_type: mongoose.Schema.Types.String,
  reward_index: mongoose.Schema.Types.Number,
  valid: mongoose.Schema.Types.Boolean,
  currency: mongoose.Schema.Types.String,
  event_id: mongoose.Schema.Types.ObjectId,
  bar_id: mongoose.Schema.Types.ObjectId,
});

const Reward = mongoose.model("Reward", rewardSchema);

module.exports.getReward = (rewardId) => {
  return Reward.findOne({ _id: rewardId }).lean().exec();
};

module.exports.getEventRewards = (eventId) => {
  return Reward.find({ event_id: eventId }).lean().exec();
};

module.exports.createReward = (rewardData) => {
  let completedData = completeRewardData(rewardData);
  const reward = new Reward(completedData);
  return reward.save();
}

module.exports.invalidateRewards = (eventId) => {
  return Reward.updateMany({event_id : eventId} , {valid : false}).exec();
}

module.exports.deleteRewardsByEventId = (eventId) => {
  return Reward.deleteMany({event_id : eventId}).exec();
}

function completeRewardData(rewardData){
  rewardData.valid = true;
  return rewardData;
}
