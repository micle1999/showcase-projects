const s3 = require("../s3/s3");
const userModel = require("../models/userModel");
const tokenModel = require("../models/refreshTokenModel");
const profileBucketName = process.env["AWS_PROFILE_BUCKET"];
const bcrypt = require("bcryptjs");

module.exports.changeUserPhoto = (req, res) => {
  userModel.findByUserId(req.body.user_id).then((user) => {
    s3.upload(
      req.body.image,
      req.body.user_id.toString(),
      req.body.type,
      profileBucketName
    )
      .then(async (result) => {
        if (!user.profile_image) {
          await userModel.changeProfileImage(user._id, true);
        }
        let signedUrl = s3.getSignedUrl(
          req.body.user_id.toString(),
          profileBucketName,
          true
        );
        res.status(200).send({ image: signedUrl });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send();
      });
  });
};

module.exports.deleteUserPhoto = (req, res) => {
  userModel
    .findByUserId(req.body.user_id)
    .then(async (user) => {
      if (!!user) {
        await s3.delete(req.body.user_id.toString(), profileBucketName);
        await userModel.changeProfileImage(user._id, false);
        res.status(200).send();
      }
      res.status(404).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.getUserPhoto = (req, res) => {
  userModel.findByUserId(req.body.user_id).then((user) => {
    if (!!user) {
      let signedUrl = s3.getSignedUrl(
        req.body.user_id.toString(),
        profileBucketName,
        user.profile_image
      );
      res.status(200).send({ image: signedUrl });
    } else res.status(404).send("No user found!");
  });
};

module.exports.getUserProfile = (req, res) => {
  userModel
    .findByUserId(req.body.user_id)
    .then((user) => {
      if (!!user) {
        const image = s3.getSignedUrl(
          req.body.user_id.toString(),
          profileBucketName,
          user.profile_image
        );
        user.image = image;
        res.status(200).send(user);
      } else res.status(404).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.changeUserData = async (req, res) => {
  userModel.findByUserId(req.body.user_id).then((user) => {
    if (!!user) {
      user.email = req.body.email;
      userModel
        .updateUserData(user)
        .then(() => {
          res.status(200).send(user);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send();
        });
    } else res.status(404).send();
  });
};

exports.changeUserPassword = (req, res) => {
  userModel.findByUserId(req.body.user_id).then(async (user) => {
    if (!!user) {
      if (await bcrypt.compare(req.body.password, user.password)) {
        const salt = await bcrypt.genSalt();
        const newPassword = await bcrypt.hash(req.body.newPassword, salt);
        userModel
          .updateUserPassword(user._id, newPassword)
          .then((user) => {res.status(200).send();})
          .catch(err => {
            console.log(err);
            res.status(500).send()
          });
      } else res.status(422).send("Passwords does not match");
    } else res.status(404).send();
  });
};

exports.deleteAccount = (req, res) => {
  userModel
    .findByUserId(req.body.user_id)
    .then(async (user) => {
      if (!!user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
          if (!!user && user.profile_image) s3.delete(user.profile_image);
          await tokenModel.deleteToken(req.body.username);
          await userModel.deleteUser(req.body.username);
          res.status(200).send();
        } else res.status(422).send("Passwords does not match");
      } else res.status(404).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};
