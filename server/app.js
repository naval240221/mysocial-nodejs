require("dotenv").config();
const cookieparser = require('cookie-parser');

const express = require("express");

const routes = require('./routes')


const server = express()
server.use(express.json());
server.use(cookieparser());
server.use('', routes)

module.exports = server;