require("dotenv").config();
const cookieparser = require('cookie-parser');

require('../config/database').connect();

const express = require("express");

const routes = require('./routes')


const server = express();
server.use(express.json());
server.use(cookieparser());
server.use('', routes)

module.exports = server;