import express from './App.js'
import bot from './TgBotService.js'
import db from './AccountDbService.js'
import { ChatAccounts } from './entity.js'

import dotenv from 'dotenv'
dotenv.config()

const port = process.env.PORT || 3000
const botWebhookPort = process.env.BOT_WH_PORT || 80

express.listen(port, (err) => {
  if (err) {
    return console.log(err)
  }

  return console.log(`server is listening on ${port}`)
})

// async function createTgBotWebhook() {
//   const webhookDomain = "http://localhost:80/bot" 
//   console.log(`webhookDomain :: ${webhookDomain}`)
//   express.use(await bot.createWebhook({ domain: webhookDomain }));
// }

// DB test
// async function waitAndSave() {
//   await sleep(1000)
//   function sleep(ms: number) {
//     return new Promise((resolve) => {
//       setTimeout(resolve, ms);
//     });
//   }
//   db.saveAccount("chatId2", "pubKey1") 
//   await sleep(1000)
//   db.deleteAccount("chatId2", "pubKey1") 
// }

// const account = {pubKey: "a2a2a2", name: "DDD"}
// const chatInfo3: ChatAccounts = {id: "3", accounts: [account]}
// waitAndSave()
