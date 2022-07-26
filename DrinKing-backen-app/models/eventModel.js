const EVENT_STATUS = require("../enums").EVENT_STATUS;
mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: mongoose.Schema.Types.String,
  bar_id: mongoose.Schema.Types.ObjectId,
  state: mongoose.Schema.Types.String,
  start_date: mongoose.Schema.Types.Number,
  end_date: mongoose.Schema.Types.Number,
  participants: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      score: mongoose.Schema.Types.Number,
    },
  ],
  receipts: [mongoose.Schema.Types.ObjectId],
});

const Event = mongoose.model("Event", eventSchema);

//CRUD Operations

module.exports.getAllEvents = () => {
  return Event.find({}).lean().exec();
};

module.exports.getEvent = (eventId) => {
  return Event.findOne({ _id: eventId }).lean().exec();
};

module.exports.getActiveEvents = () => {
  return Event.find({ state: { $ne: EVENT_STATUS.FINISHED } })
    .lean()
    .exec();
};

module.exports.getParticipants = (eventId) => {
  return Event.findOne({ _id: eventId }, "participants").lean().exec();
};

module.exports.getParticipant = (eventId, participant) => {
  return Event.findOne({ _id: eventId })
    .select({ participants: { $elemMatch: { userId: participant } } })
    .lean()
    .exec();
};

module.exports.getEventName = (eventId) => {
  return Event.findOne({ _id: eventId })
      .select('name')
      .lean()
      .exec();
};

module.exports.addParticipant = (eventId, participant, score) => {
  return Event.findOneAndUpdate(
    { _id: eventId },
    { $push: { participants: { userId: participant, score: score } } }
  ).exec();
};

module.exports.removeParticipant = (eventId, participant) => {
  return Event.findOneAndUpdate(
      { _id: eventId },
      { $pull: { participants: {userId: participant} } } //TODO TEST
  ).exec();
};

module.exports.incrementParticipantScore = (eventId, participant, value) => {
  return Event.findOneAndUpdate(
    { _id: eventId, participants: { $elemMatch: { userId: participant } } },
    { $inc: { "participants.$.score": value } }
  ).exec();
};

module.exports.decrementParticipantScore = (eventId, participant, value) => {
  return Event.findOneAndUpdate(
      { _id: eventId, participants: { $elemMatch: { userId: participant } } },
      { $inc: { "participants.$.score": -value } }
  ).exec();
};

module.exports.createEvent = (eventData) => {
  eventData.state = EVENT_STATUS.UPCOMING;
  const event = new Event(eventData);
  return event.save();
};

module.exports.updateState = (eventId, state) => {
  return Event.findOneAndUpdate({ _id: eventId }, { state: state })
    .lean()
    .exec();
};

module.exports.deleteEvent = (eventId) => {
  return Event.findOneAndDelete({ _id: eventId,state: { $nin: [EVENT_STATUS.FINISHED,EVENT_STATUS.ONGOING,EVENT_STATUS.REVIEWING]}}).exec();
};

module.exports.insertMany = (data) => {
  return Event.insertMany(data);
}

module.exports.deleteAll = () => {
  return Event.deleteMany({}).exec();
}
