require("dotenv").config();
const cookieparser = require('cookie-parser');

require('../config/database').connect();

const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");

const routes = require('./routes')


const server = express();
server.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

server.use(rateLimit({
    windowMs: 2 * 60 * 1000, // 5 minutes duration
    max: 100,
    message: "You have exceeded the 100 requests in 2 minutes limit",
    standardHeaders: true,
    legacyHeaders: false
}))

// adding Helmet to enhance your Rest API's security
server.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
server.use(bodyParser.json());

// enabling CORS for all requests
server.use(cors());

// adding morgan to log HTTP requests
server.use(morgan('combined'));

server.use(express.json());
server.use(cookieparser());
server.use('', routes)

module.exports = server;