const LOGGLY_TOKEN = process.env["LOGGLY_TOKEN"];
const LOGGLY_SUBDOMAIN = process.env["LOGGLY_SUBDOMAIN"];
const winston  = require('winston');
require('winston-loggly-bulk');
const expressWinston = require('express-winston');

module.exports.log = expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.Loggly({
            subdomain: LOGGLY_SUBDOMAIN,
            inputToken: LOGGLY_TOKEN,
            json: true,
            tags: ["NodeJS-Express"]
        })
    ]
})
