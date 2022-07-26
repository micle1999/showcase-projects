mongoose = require("mongoose");

const barSchema = new mongoose.Schema({
  manager: mongoose.Schema.Types.ObjectId,
  name: mongoose.Schema.Types.String,
  address: {
    street: mongoose.Schema.Types.String,
    building_number: mongoose.Schema.Types.String,
    city: mongoose.Schema.Types.String,
    postal_code: mongoose.Schema.Types.String
  },
  images: [mongoose.Schema.Types.String],
  phone_number: mongoose.Schema.Types.String,
});

const Bar = mongoose.model("Bar", barSchema);

module.exports.getBarByName = (name) => {
  return Bar.findOne({ name: name }).lean().exec();
};

module.exports.updateManager = (manager, id) => {
  return Bar.findOneAndUpdate({ _id: id }, { manager: manager }).exec();
};

module.exports.createBar = (barData) => {
  const bar = new Bar(barData);
  bar.images = [];
  return bar.save();
};

module.exports.getBars = () => {
  return Bar.find({}).lean().exec();
};

module.exports.getBar = (barId) => {
  return Bar.findOne({ _id: barId }).lean().exec();
};

module.exports.getBarByManager = (managerId) => {
  return Bar.findOne({ manager: managerId }).lean().exec();
};

module.exports.getManagedBar = (userId) => {
  return Bar.findOne({ manager: userId }).lean().exec();
};

module.exports.getAddress = (barId) => {
  return Bar.findOne({ _id: barId }).select("address").lean().exec();
};

module.exports.getBarName = (barId) => {
  return Bar.findOne({ _id: barId }).select("name").lean().exec();
};

module.exports.addImages = (barId, imageIds) => {
  return Bar.findOneAndUpdate(
    { _id: barId },
    { $push: { images: { $each: imageIds } } }
  );
};

module.exports.addImage = (barId, imageId) => {
  return Bar.findOneAndUpdate(
    { _id: barId },
    { $push: { images:  imageId  } }
  );
};

module.exports.removeImage = (barId, imageId) => {
  return Bar.findOneAndUpdate(
    { _id: barId },
    { $pull: { images: imageId } }
  );
};

module.exports.insertMany = (data) => {
  return Bar.insertMany(data);
}

module.exports.deleteAll = () => {
  return Bar.deleteMany({}).exec();
}
