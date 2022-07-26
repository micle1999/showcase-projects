const RateLimit = require('express-rate-limit');

module.exports.apiLimiter = new RateLimit({
    windowMs: 5*60*1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs 100
    message: "Too many requests from this IP, please try again after an 15 minutes"
});

module.exports.createAccountLimiter = new RateLimit({
    windowMs: 10*60*1000, // 10 minutes
    max: 10,
    message: "Too many accounts created from this IP, please try again after an hour"
});

module.exports.createObjectLimiter = new RateLimit({
    windowMs: 10*60*1000, // 10 minutes
    max: 50,
    message: "Too many objects created from this IP, please try again after an hour"
});
