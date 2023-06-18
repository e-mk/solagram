import pino from "pino";
import dotenv from 'dotenv'
dotenv.config()

export default pino.pino({level: process.env.LOG_LEVEL || "error"});