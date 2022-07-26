const EVENT_STATUS = require("../enums").EVENT_STATUS;
const EMAIL_TYPE = require("../enums").EMAIL_TYPE;
const eventModel = require("../models/eventModel");
const barModel = require("../models/barModel");
const userModel = require("../models/userModel");
const userController = require("../controllers/userController");
const rewardModel = require("../models/rewardModel");
const profileBucketName = process.env["AWS_PROFILE_BUCKET"];
const barBucketName = process.env["AWS_BAR_BUCKET"];
const scheduler = require("../schedulers/eventScheduler");
const sender = require("../notifications/emailSender");
const s3 = require("../s3/s3");

module.exports.getEvent = (req, res) => {
  eventModel
    .getEvent(req.params.eventId)
    .then(async (event) => {
      try {
        if (!!event) {
          event.rewards = await rewardModel.getEventRewards(event._id);
          event = await collectBarData(event, true);
          event.participants = await collectUserData(event.participants);
          event.participants = await getSortedParticipants(event.participants);
          res.status(200).send(event);
        } else res.status(404).send();
      } catch (err) {
        console.log(err);
        res.status(500).send();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.getAllEvents = (req, res) => {
  eventModel.getAllEvents().then(async (events) => {
    if (!!events && events.length > 0) {
      try {
        for (let event of events) {
          event = await collectBarData(event, true);
        }
      } catch (err) {
        console.log(err);
        return res.status(500).send();
      }
      return res.status(200).send(events);
    } else res.status(404).send();
  });
};

module.exports.getActiveEvents = (req, res) => {
  eventModel.getActiveEvents().then(async (events) => {
    if (!!events && events.length > 0) {
      try {
        //let updatedEvents = await updateListOfEventsStatus(list);
        for (let event of events) {
          event.rewards = await rewardModel.getEventRewards(event._id);
          event = await collectBarData(event, true);
        }
        res.status(200).send(events);
      } catch (err) {
        console.log(err);
        res.status(500).send();
      }
    } else res.status(404).send();
  });
};

module.exports.createEvent = (req, res, next) => {
  eventModel
    .createEvent(req.body.event)
    .then((result) => {
      if (!!result) {
        console.log("Scheduling job for event : " + result._id.toString())
        scheduler.scheduleEventUpdateJob(
            result._id.toString(),
            result.start_date
        );
        req.body.event.event_id = result._id;
        next();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.finishEvent = (req, res) => {
  eventModel.getEvent(req.params.eventId).then((event) => {
    if (event.state !== EVENT_STATUS.FINISHED) {
      eventModel
        .updateState(req.params.eventId, EVENT_STATUS.FINISHED)
        .then(async (updatedEvent) => {
          if (!!updatedEvent) {
            const sortedParticipants = await getSortedParticipantsByEventId(
              req.params.eventId
            );
            console.log("Participants:" + JSON.stringify(sortedParticipants));
            await userController.delegatePrizes(
              sortedParticipants,
              req.params.eventId
            );
            await rewardModel.invalidateRewards(req.params.eventId);
            const emailData = await userModel.getEmailDataForUsers(
              req.params.eventId
            );
            console.log(emailData);
            res.status(200).send();
            for (let participant of emailData) {
              const data = {
                username: participant.username,
                eventName: updatedEvent.name,
                userPoints: sortedParticipants.find(
                  (p) => p.user_id === participant._id
                ).score,
              };
              await sender.sendEmail(
                participant.email,
                data,
                EMAIL_TYPE.EVENT_END
              );
            }
          } else res.status(404).send();
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send();
        });
    } else res.status(403).send("You cannot finish already finished event");
  });
};

module.exports.reviewingEvent = (req, res) => {
  eventModel
    .updateState(req.params.eventId, EVENT_STATUS.REVIEWING)
    .then(async (result) => {
      if (!!result) {
        res.status(200).send();
      } else res.status(404).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.deleteEvent = (req, res) => {
  eventModel
    .deleteEvent(req.params.eventId)
    .then(async (result) => {
      if (!!result) {
        scheduler.cancelEventUpdateJob(req.params.eventId);
        res.status(200).send();
      } else
        res
          .status(404)
          .send(
            "Event with given id does not exist or is in state that is forbidden to delete."
          );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.addScoreToParticipant = (eventId, userId, score) => {
  eventModel
    .getParticipant(eventId, userId)
    .then(async (result) => {
      if (!!result.participants) {
        await eventModel.incrementParticipantScore(eventId, userId, score);
      } else {
        await addParticipant(eventId, userId, score);
        await userModel.incrementTotalEvents(userId);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.subtractScoreOfParticipant = (eventId, userId, score) => {
  eventModel.getParticipant(eventId, userId).then(async (result) => {
    if (!!result.participants && result.participants[0].score > score) {
      await eventModel.decrementParticipantScore(eventId, userId, score);
    } else {
      await eventModel.removeParticipant(eventId, userId);
      await userModel.decrementTotalEvents(userId);
    }
  });
};

module.exports.updateEventStatus = (event) => {
  switch (event.state) {
    case EVENT_STATUS.UPCOMING:
      if (Date.now() >= event.start_date && Date.now() < event.end_date) {
        event.state = EVENT_STATUS.ONGOING;
        scheduler.scheduleEventUpdateJob(
            event._id.toString(),
            event.end_date
        );
      } else if (Date.now() >= event.end_date) {
        event.state = EVENT_STATUS.REVIEWING;
      }
      break;
    case EVENT_STATUS.ONGOING:
      if (Date.now() >= event.end_date) {
        event.state = EVENT_STATUS.REVIEWING;
      }
      break;
    default:
      break;
  }
  return eventModel.updateState(event._id, event.state);
};

module.exports.updateEventStatusById = async (eventId) => {
  let event = await eventModel.getEvent(eventId);
  return await module.exports.updateEventStatus(event);
};

function addParticipant(eventId, userId, score) {
  return eventModel.addParticipant(eventId, userId, score);
}

async function getSortedParticipantsByEventId(eventId) {
  let result = await eventModel.getParticipants(eventId);
  result.participants.sort((a, b) => parseInt(b.score) - parseInt(a.score));
  console.log(result.participants);
  return result.participants;
}

async function getSortedParticipants(participants) {
  participants.sort((a, b) => parseInt(b.score) - parseInt(a.score));
  return participants;
}

async function collectUserData(participants) {
  for (let participant of participants) {
    const user = await userModel.findByUserId(participant.userId);
    participant.username = user.username;
    participant.image = s3.getSignedUrl(
      user._id.toString(),
      profileBucketName,
      user.profile_image
    );
  }
  return participants;
}

async function collectBarData(event, image) {
  const bar = await barModel.getBar(event.bar_id);
  if (image && bar.images.length > 0) {
    event.image = s3.getSignedUrl(bar.images[0], barBucketName, true);
  }
  event.address = bar.address;
  event.barName = bar.name;
  return event;
}
