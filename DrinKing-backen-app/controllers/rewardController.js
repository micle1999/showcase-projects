const RewardModel = require("../models/rewardModel");
const BarModel = require("../models/barModel");
const EventModel = require("../models/eventModel");
const sender = require("../notifications/emailSender");
const EMAIL_TYPE = require("../enums").EMAIL_TYPE;
const scheduler = require("../schedulers/eventScheduler")

module.exports.createRewards = async (req, res) => {
  const rewards = req.body.rewards;
  for (let reward of rewards) {
    reward.event_id = req.body.event.event_id;
    reward.bar_id = req.body.event.bar_id;
    RewardModel.createReward(reward).catch((err) => {
      console.log(err);
      EventModel.deleteEvent(req.body.event.event_id).then(() => {
        RewardModel.deleteRewardsByEventId(req.body.event.event_id).then(() => {
          scheduler.cancelEventUpdateJob(req.body.event.event_id.toString());
          res.status(500).send();
        });
      });
    });
  }
  const bar = await BarModel.getBar(req.body.event.bar_id);
  const emailData = {
    eventName: req.body.event.name,
    barName: bar.name,
    startDate: getDateWithTime(req.body.event.start_date)
  }
  sender.sendBulkEmailToAll(emailData, EMAIL_TYPE.NEW_EVENT).catch(err => {
    console.log(err);
  })
  res.status(201).send();
}


function getDateWithTime(date){
  let newDate = new Date(date);
  newDate =
      newDate.getDate() +
      "." +
      (newDate.getMonth() + 1) +
      "." +
      newDate.getFullYear() +
      " " +
      newDate.getHours() +
      ":" +
      ("0" + newDate.getMinutes()).slice(-2);

  return newDate;
}
