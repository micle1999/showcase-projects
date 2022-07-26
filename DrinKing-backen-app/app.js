require("dotenv").config({ path: __dirname + "/.env" });

const utils = require("./utils");

const express = require("express");

const http = require("http");

const app = express();

const { Server } = require("socket.io");

const server = http.createServer(app);

const options = {
    cors: {
        origin: "*",
        allowedHeaders: "*",
        exposedHeaders: ["accesstoken", "refreshtoken"],
        credentials: true,
    },
    rejectUnauthorized: false
}

const io = new Server(server,options);

const port = process.env.PORT || 3000;

const cors = require("cors");

const limiter = require("./middleware/limiters");

const swaggerUi = require('swagger-ui-express');

const swaggerDoc = require('./docs/swagger.json');

const LOGGLY_TOKEN = process.env["LOGGLY_TOKEN"];

const LOGGLY_SUBDOMAIN = process.env["LOGGLY_SUBDOMAIN"];

const winston = require('winston');

require('winston-loggly-bulk');

const expressWinston = require('express-winston');

const socketConsumer = require('./sockets/socketConsumer.js');

//const garbageCollector = require();

//const init = require();

const mongoose = require("mongoose");

if(process.env.NODE_ENV !== 'test'){
    const dburi = utils.getDbUri();
    mongoose
        .connect(dburi)
        .then(() => {
            console.log("connected to MongoDB");
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
}

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Loggly({
            subdomain: LOGGLY_SUBDOMAIN,
            inputToken: LOGGLY_TOKEN,
            json: true,
            tags: ["NodeJS-Express"],
            colorize : true
        })
    ],
}));

expressWinston.requestWhitelist.push('body');

app.use(express.json({limit: '10mb'}));

app.use(express.urlencoded({limit: '10mb' , extended : false}) );

let corsOptions = {
    origin: true,
    allowedHeaders: '*',
    exposedHeaders: ['accesstoken','refreshtoken'],
    credentials: true,
};

app.use(cors(corsOptions));

app.enable("trust proxy");

//garbageCollector.execute();

//init.execute(); => assign jobs for updating events ...

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use("/api/users", require("./routes/api/usersRoutes.js"), limiter.apiLimiter);

app.use("/api/profile", require("./routes/api/profileRoutes.js"), limiter.apiLimiter);

app.use("/api/events", require("./routes/api/eventRoutes.js"), limiter.apiLimiter);

app.use("/api/bars", require("./routes/api/barRoutes.js"), limiter.apiLimiter);

app.use("/api/transactions", require("./routes/api/transactionRoutes.js"), limiter.apiLimiter);

app.use("/api/receipts", require("./routes/api/receiptRoutes.js"), limiter.apiLimiter);

socketConsumer.start(io);

module.exports = server.listen(port.toString(), () => console.log("Server listening on port " + port));
