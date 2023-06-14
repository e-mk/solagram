const pino = require("pino");
require('dotenv').config();

export default pino({level: process.env.LOG_LEVEL || "error"});