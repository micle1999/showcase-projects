const RTmodel = require("../models/refreshTokenModel");
const CTmodel = require("../models/confirmationTokenModel");
const ResetTmodel = require("../models/resetTokenModel");
const UserModel = require("../models/userModel");
const ROLE = require("../enums").ROLES;
const jwt = require("jsonwebtoken");
const config = require("../config");
const crypto = require("crypto");

async function authorize_u(req, res, next) {
  if (req.headers.accesstoken != null) {
    jwt.verify(req.headers.accesstoken, config.secret, async (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).send({error: new Error("Unauthorized")});
      }
      if (decoded != null) {
        UserModel.findByUserId(decoded.userId)
          .then((user) => {
            if (
              !!user &&
              (user.role === ROLE.USER || user.role === ROLE.ADMIN)
            ) {
              req.body.user_id = user._id;
              req.body.role = user.role;
              next();
            } else return res.status(401).send({error: new Error("Unauthorized")});
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).send({error: new Error("Server error")});
          });
      }
    });
  } else {
    return res.status(410).send({error: new Error("Token not present")});
  }
}

async function authorize_b(req, res, next) {
  if (req.headers.accesstoken != null) {
    jwt.verify(req.headers.accesstoken, config.secret, async (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).send({error: new Error("Unauthorized")});
      }
      if (decoded != null) {
        UserModel.findByUserId(decoded.userId)
          .then((user) => {
            if (
              !!user &&
              (user.role === ROLE.BAR || user.role === ROLE.ADMIN)
            ) {
              req.body.user_id = user._id;
              req.body.role = user.role;
              next();
            } else return res.status(401).send({error: new Error("Unauthorized")});
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).send({error: new Error("Server error")});
          });
      }
    });
  } else return res.status(409).send({error: new Error("Token not present")});
}

async function authorize_a(req, res, next) {
  if (!!req.headers.accesstoken != null) {
    jwt.verify(req.headers.accesstoken, config.secret, async (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).send({error: new Error("Unauthorized")});
      }
      if (decoded != null) {
        UserModel.findByUserId(decoded.userId)
          .then((user) => {
            if (!!user && user.role === ROLE.ADMIN) {
              req.body.user_id = user._id;
              req.body.role = user.role;
              next();
            } else return res.status(401).send({error: new Error("Unauthorized")});
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).send({error: new Error("Server error")});
          });
      }
    });
  } else return res.status(409).send({error: new Error("Token not present")});
}

async function authorize_b_login(req, res, next) {
  const user = await UserModel.findByUsername(req.body.username);
  if (!!user && (user.role === ROLE.ADMIN || user.role === ROLE.BAR)) {
    req.body.userId = user._id;
    req.body.role = user.role;
    next();
  } else res.status(401).send();
}

async function authorize_socket(token) {
  if (!!token) {
    jwt.verify(token, config.secret, async (err, decoded) => {
      console.log("error: " + err);
      console.log("token: " + JSON.stringify(decoded));
      if (err) {
        return null;
      }
    });
    try {
      const decodedToken = jwt.decode(token);
      const user = await UserModel.findByUserId(decodedToken.userId);
      return { user_id: user._id, role: user.role, username: user.usernam, email: user.email };
    } catch (err) {
      console.log(err);
      return null;
    }
  } else return null;
}

function sign(userId) {
  return jwt.sign({ userId: userId }, config.secret, { expiresIn: "1h" });
}

async function refreshToken(req, res) {
  const refreshToken = await getValidRefreshToken(req.body.refreshToken);
  console.log("Refresh token from database= " + refreshToken);
  if (refreshToken != null) {
    const expirationDate = getAccessTokenExpDate();
    const accessToken = sign(refreshToken.user_id);
    res.setHeader("accessToken", accessToken);
    res.status(200).send({ expirationDate: expirationDate });
  } else {
    res.status(404).send("Refresh token does not match.");
  }
}

function createRefreshToken(userId) {
  return generateRefreshToken(userId);
}

function createToken(userId, email, type) {
  if (type === "reset") {
    return generateResetToken(userId, email);
  } else if (type === "confirm") {
    return generateConfirmationToken(userId, email);
  } else return null;
}

async function getValidRefreshToken(token) {
  const refreshToken = await RTmodel.findToken(token);
  console.log("refresh token from db: " + JSON.stringify(refreshToken));
  if (refreshToken == null || RTmodel.isExpired(refreshToken.expires)) return null;
  console.log("getValidRefreshToken token = " + refreshToken);
  if(refreshToken){
    return refreshToken;
  }
  return null;
}

async function generateRefreshToken(userId) {
  const token = randomTokenString();
  await RTmodel.createRefreshToken({
    user_id: userId,
    token: token,
    expires: new Date(Date.now() + 60 * 1000), //Date.now() + 7 * 24 * 60 * 60 * 1000
  }).catch((err) => {
    console.log(err);
  });
  return token;
}

async function generateConfirmationToken(userId, userEmail) {
  const token = randomTokenString();
  await CTmodel.createConfirmationToken({
    user_id: userId,
    user_email: userEmail,
    token: token,
  }).catch((err) => {
    console.log(err);
  });
  return token;
}

async function generateResetToken(userId, userEmail) {
  const token = randomTokenString();
  await ResetTmodel.createResetToken({
    user_id: userId,
    user_email: userEmail,
    token: token,
  }).catch((err) => {
    console.log(err);
  });
  return token;
}

async function renewRefreshToken(userId) {
  const refreshToken = await RTmodel.findByUserId(userId);
  console.log("Found old refresh token = " + refreshToken);
  if (refreshToken != null) await RTmodel.deleteTokenByUserId(userId);
  return generateRefreshToken(userId);
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

function deleteRefreshToken(userId) {
  return RTmodel.deleteTokenByUserId(userId);
}

function getAccessTokenExpDate() {
  //return Date.now() + 60 * 60 * 1000;
  return Date.now() + 1 * 60 * 1000;
}

module.exports = {
  getAccessTokenExpDate,
  sign,
  authorize_u,
  authorize_b_login,
  authorize_b,
  authorize_a,
  authorize_socket,
  createRefreshToken,
  createToken,
  renewRefreshToken,
  refreshToken,
  deleteRefreshToken,
};
