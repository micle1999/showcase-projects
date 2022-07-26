const _ = require("lodash");
const schemas = require("./validationSchemas.js");

module.exports = () => {
  const _validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true, // remove unknown keys from the validated data
  };

  return (req, res, next) => {
    const route = req.baseUrl + req.route.path;
    const _schema = _.get(schemas, route);
    const { error, value } = _schema.validate(req, _validationOptions);
    if (error) {
      console.log(error);
      return res.status(422).send(error.message);
    } else next();
  };
};
