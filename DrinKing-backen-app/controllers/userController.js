const UserModel = require("../models/userModel");
const RewardModel = require("../models/rewardModel");
const BarModel = require("../models/barModel");
const ConfTokenModel = require("../models/confirmationTokenModel");
const ResetTokenModel = require("../models/resetTokenModel");
const bcrypt = require("bcryptjs");
const validation = require("../middleware/validation/utils");
const auth = require("../middleware/authorization");
const DISCOUNT_TYPE = require("../enums").DISCOUNT_TYPE;
const TROPHY_TYPE = require("../enums").TROPHY_TYPE
const EMAIL_TYPE = require("../enums").EMAIL_TYPE;
const ROLES = require("../enums").ROLES;
const barBucketName = process.env["AWS_BAR_BUCKET"];
const sender = require("../notifications/emailSender");
const s3 = require("../s3/s3");

module.exports.register = async (req, res) => {
  const duplicity = await validation.userDuplicityCheck(
    req.body.username,
    req.body.email
  );
  if (duplicity != null) {
    res.status(409).send({ duplicityType: duplicity });
  } else {
    UserModel.createUserAccount(req.body)
      .then(async (result) => {
        const accessToken = auth.sign(result._id);
        const refreshToken = await auth.createRefreshToken(result._id);
        //const confirmationToken = await auth.createConfirmationToken(
        //  result._id,
        //  result.email
        //);
        const expirationDate = auth.getAccessTokenExpDate();
        // sender.sendEmail(
        //   req.body.email,
        //   {token : confirmationToken},
        //   EMAIL_TYPE.CONFIRM_ACCOUNT
        // );
        res.setHeader("accesstoken", accessToken);
        res.setHeader("refreshtoken", refreshToken);
        res.status(201).send({ expirationDate: expirationDate });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send();
      });
  }
};

module.exports.registerBarUser = async (req, res, next) => {
  const duplicity = await validation.userDuplicityCheck(
    req.body.manager.username,
    req.body.manager.email
  );
  if (!!duplicity) {
    res.status(409).send({ duplicityType: duplicity });
  } else {
    UserModel.createBarAccount(req.body.manager)
      .then((result) => {
        if (!!result) {
          req.body.bar.manager = result._id;
          next();
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send();
      });
  }
};

module.exports.login = (req, res) => {
  UserModel.findByUsername(req.body.username)
    .then(async (result) => {
      if (!!result) {
        if (await bcrypt.compare(req.body.password, result.password) && !result.banned && (result.role === ROLES.USER || result.role === ROLES.ADMIN)) {
          //if (!result.active) {
          //authorized
          console.log("After login db user = "+ JSON.stringify(result));
          const accessToken = auth.sign(result._id);
          const refreshToken = await auth.renewRefreshToken(result._id);
          const expirationDate = auth.getAccessTokenExpDate();
          res.setHeader("accessToken", accessToken);
          res.setHeader("refreshToken", refreshToken);
          res.status(200).send({
            expirationDate: expirationDate,
            role: result.role,
          });
          // } else res.status(410).send("Confirm your email first please."); //CUSTOM error code
        } else res.status(401).send();
      } else res.status(404).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.setBanStatus = async (req, res) => {
  if(req.body.banStatus){
    await auth.deleteRefreshToken(req.params.userId);
  }
  UserModel.setBanStatus(req.params.userId, req.body.banStatus).then(result => {
    res.status(200).send();
  }).catch(err => {
    console.log(err);
    res.status(500).send(err);
  })
}

module.exports.getPrizes = (req, res) => {
  UserModel.findByUserId(req.body.user_id).then(async (user) => {
    let resObject = [];
    try {
      if (!!user.prizes.length > 0) {
        for (let prize of user.prizes) {
          let bar = await BarModel.getBar(prize.bar_id);
          resObject.push(createPrizeResObject(prize, bar));
          res.status(200).send(resObject);
        }
      } else res.status(200).send([]);
    } catch (err) {
      console.log(err);
      res.status(500).send();
    }
  });
};

module.exports.resendConfirmationEmail = (req, res) => {
  UserModel.findByEmail(req.body.email)
    .then(async (user) => {
      if (user.email) {
        await ConfTokenModel.deleteTokenByEmail(user.email);
        const confToken = await auth.createToken(
          user._id,
          user.email,
          "confirm"
        );
        await sender.sendEmail(user.email, {token : confToken}, EMAIL_TYPE.CONFIRM_ACCOUNT);
        res.status(200).send();
      } else res.status(404).send("User not found.");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.resetPasswordEmail = (req, res) => {
  UserModel.findByEmail(req.params.email)
    .then(async (user) => {
      if (user) {
        await ResetTokenModel.deleteTokenByEmail(user.email);
        const resetToken = await auth.createToken(
          user._id,
          user.email,
          "reset"
        );
        await sender.sendEmail(
          user.email,
            {token : resetToken.token},
          EMAIL_TYPE.PASSWORD_RESET
        );
        res.status(200).send();
      }
      res.status(404).send("User not found.");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.resetPassword = (req, res) => {
  ResetTokenModel.findToken(req.params.token)
    .then(async (token) => {
      if (token) {
        const salt = await bcrypt.genSalt();
        const newPassword = await bcrypt.hash(req.body.password, salt);
        UserModel.updateUserPassword(token.user_id, newPassword).catch(
          res.status(500).send()
        );
        await ResetTokenModel.deleteToken(token.token);
        res.status(200).send();
      } else res.status(404).send("Invalid token or expired.");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.confirmEmail = (req, res) => {
  ConfTokenModel.findToken(req.params.token)
    .then(async (token) => {
      if (token.user_id) {
        await UserModel.activateAccount(token.user_id);
        await ConfTokenModel.deleteToken(req.params.token);
      } else res.status(404).send("Token not found.");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.getAllUsers = (req, res) => {
  UserModel.findAllUsers()
      .then((users) => {
        res.status(200).send(users);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Server error.");
      });
};

module.exports.getEmailsOfAllUsers = async () => {
  const rawData = await UserModel.getEmailsOfAllUsers();
  let emails = []
  for(let raw of rawData){
    emails.push(raw.email);
  }
  return emails
};

module.exports.delegatePrizes = async (winners, eventId) => {
  let rewards = await RewardModel.getEventRewards(eventId);
  rewards = getSortedRewards(rewards);
  for (let a = 0; a < rewards.length; a++) {
    if (winners[a]) {
      await delegatePrize(
        winners[a],
        rewards[a]
      );
    } else break;
  }
};

async function delegatePrize(winner, reward) {
  if(reward.discount_type === DISCOUNT_TYPE.CASH){
    await delegateCashPrize(winner, reward.value, reward.reward_index, reward.bar_id);
  }else{
    await delegatePercentPrize(winner, reward.value, reward.reward_index, reward.bar_id);
  }
}

async function delegateCashPrize(winner, rewardValue, rewardIndex, barId) {
  const barPresent = await UserModel.getBarCreditValueById(
    winner.userId,
    barId
  );
  if (barPresent.prizes.length > 0) {
    await UserModel.addExistingPrize(winner.userId, rewardValue, barId);
    console.log("Adding existing reward")
  } else {
    console.log("Adding new Reward")
    console.log("DATA;" + winner.userId + " " + rewardValue + " " + barId);
    await UserModel.addNewPrize(winner.userId, rewardValue, barId);
  }
  const trophy = getTrophy(rewardIndex);
  if(trophy != null){
    await UserModel.addTrophy(winner.userId, trophy);
  }
  await setBestScore(winner.score, winner.userId);
  await addTotalCreditsGained(rewardValue, winner.userId);
}

async function delegatePercentPrize(winner, rewardValue, rewardIndex, barId) {
  const value = (rewardValue / 100) * winner.score;
  const barPresent = await UserModel.getBarCreditValueById(
      winner.userId,
    barId
  );
  console.log("Is bar present ? : " + JSON.stringify(barPresent));
  if (barPresent.prizes.length > 0) {
    console.log("Adding to existing bar rpzie");
    await UserModel.addExistingPrize(winner.userId, value, barId);
  } else {
    console.log("Adding new bar prize");
    console.log("DATA;" + winner.userId + " " + rewardValue + " " + barId);
    await UserModel.addNewPrize(winner.userId, value, barId);
  }
  const trophy = getTrophy(rewardIndex);
  if(trophy != null){
    await UserModel.addTrophy(winner.userId, trophy);
  }
  await setBestScore(winner.score, winner.userId);
  await addTotalCreditsGained(value, winner.userId);
}

function createPrizeResObject(prize, bar) {
  return {
    barId: bar._id,
    credits: prize.credit,
    barImage: s3.getSignedUrl(bar.images[0], barBucketName, true),
    barName: bar.name,
    barAddress: bar.address,
  };

  //TODO check if any image exist
  //TODO if rewards does not exist , delete event and send error message
  //TODO validace (posielat numbers), kontrola datumov v minulosti atd, pocitanie kreditov, pridavanie rewards
  //TODO data pre bar z manager objektu
}

function setBestScore(eventScore, userId) {
  UserModel.findByUserId(userId).then(async (user) => {
    if (user.best_score < eventScore) {
      await UserModel.setBestScore(userId, eventScore);
    }
  });
}

async function addTotalCreditsGained(creditsGained, userId) {
  await UserModel.incrementCreditsGained(userId, creditsGained);
}

function getSortedRewards(rewards) {
  rewards.sort((a, b) => parseInt(b.reward_index) - parseInt(a.reward_index));
  return rewards;
}

function getTrophy(rewardIndex){
  switch (rewardIndex) {
    case 0: return TROPHY_TYPE.GOLD;
    case 1: return TROPHY_TYPE.SILVER;
    case 2: return TROPHY_TYPE.BRONZE;
    default: return null;
  }
}
