const DUPLICITY_TYPE = require("../../enums").DUPLICITY_TYPE;
const UserModel = require("../../models/userModel");
const BarModel = require("../../models/barModel");

module.exports.userDuplicityCheck = async (username, email) => {
    let duplicity = await UserModel.findByUsername(username);
    if (duplicity != null) return DUPLICITY_TYPE.USERNAME;
    duplicity = await UserModel.findByEmail(email);
    if (duplicity != null) return DUPLICITY_TYPE.EMAIL;
    return null;
};

module.exports.barDuplicityCheck = async (name) => {
    let duplicity = await BarModel.getBarByName(name);
    if (duplicity != null) return DUPLICITY_TYPE.NAME;
    return null;
};
