const ROLES = require("../enums").ROLES;
const crypto = require("crypto");
const s3 = require("../s3/s3");
const barBucketName = process.env["AWS_BAR_BUCKET"];
const BarModel = require("../models/barModel");
const validation = require("../middleware/validation/utils");
const UserModel = require("../models/userModel");

module.exports.createBar = async (req, res) => {
  const duplicity = await validation.barDuplicityCheck(req.body.bar.name);
  if (!!duplicity) {
    UserModel.deleteUser(req.body.manager.username).then(() => {
      res.status(409).send({ duplicityType: duplicity });
    });
  } else {
    BarModel.createBar(req.body.bar)
      .then((result) => {
        if (!!result) {
          console.log(result);
          res.status(201).send();
        }
      })
      .catch((err) => {
        UserModel.deleteUser(req.body.manager.username).then(() => {
          console.log(err);
          res.status(500).send();
        });
      });
  }
};

module.exports.assignManagerToBar = (req, res) => {
  BarModel.updateManager(req.body.manager, req.body.barId)
    .then((result) => {
      if (!!result) {
        res.status(200).send();
      } else res.status(404).send();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.getBar = async (req, res) => {
  let bars = [];
  try {
    if (req.body.role === ROLES.ADMIN) {
      bars = await getAllBars();
    } else if (req.body.role === ROLES.BAR) {
      bars = await getBar(req.body.user_id);
    }
    res.status(200).send(bars);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

module.exports.getSpecificBar = (req, res) => {
  UserModel.findByUserId(req.body.user_id)
    .then((user) => {
      BarModel.getBar(req.params.barId).then((result) => {
        if (!result) res.status(404).send();
        if (
          result.manager.toString() === user._id.toString() ||
          user.role === ROLES.ADMIN
        ) {
          let images = [];
          for (let image of result.images) {
            images.push({
              imageId: image,
              image: s3.getSignedUrl(image, barBucketName, true),
            });
          }
          result.images = images;
          res.status(200).send(result);
        } else {
          res.status(401).send();
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
};

module.exports.addImage = (req, res) => {
  BarModel.getBar(req.params.barId).then(async (bar) => {
    if (
      bar.manager.toString() === req.body.user_id.toString() ||
      req.body.role === ROLES.ADMIN
    ) {
      try {
        const imageId = crypto.randomUUID();
        await s3.upload(req.body.image, imageId, req.body.type, barBucketName);
        await BarModel.addImage(req.params.barId, imageId);
        const signedUrl = s3.getSignedUrl(imageId, barBucketName, true);
        res.status(201).send({ image: signedUrl });
      } catch (err) {
        console.log(err);
        res.status(500).send();
      }
    } else res.status(401).send("Not authorize to change photo for this bar.");
  });
};

module.exports.deleteImage = (req, res) => {
  BarModel.getBar(req.params.barId).then(async (bar) => {
    if (
      bar.manager.toString() === req.body.user_id.toString() ||
      req.body.role === ROLES.ADMIN
    ) {
      try {
        await s3.delete(req.body.imageId, barBucketName);
        await BarModel.removeImage(req.params.barId, req.body.imageId);
        res.status(200).send();
      } catch (err) {
        console.log(err);
        res.status(500).send();
      }
    }
  });
};

async function getBar(userId) {
  return BarModel.getBarByManager(userId).then((bar) => {
    if (bar) {
      let images = [];
      for (let image of bar.images) {
        images.push({
          imageId: image,
          image: s3.getSignedUrl(image, barBucketName, true),
        });
      }
      bar.images = images;
      return [bar];
    } else {
      return [];
    }
  });
}

async function getAllBars() {
  return BarModel.getBars()
    .then(async (bars) => {
      if (bars) {
        for (let bar of bars) {
          if (bar.images.length > 0) {
            bar.image = s3.getSignedUrl(bar.images[0], barBucketName, true);
          }
        }
        return bars;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}
