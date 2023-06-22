import pino from "pino";
import dotenv from 'dotenv'
dotenv.config()

export default pino.pino({level: process.env.SOLAGRAM_LOG_LEVEL || "error"});