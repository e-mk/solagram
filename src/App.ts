import express from 'express'
import logger from './logger.js'
import bot from './TgBotService.js'

class App {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    this.express.use(express.json());

    const router = express.Router()
    router.post('/webhook', (req, res) => {
      let accountData = req.body[0].accountData
      let description = req.body[0].description
      logger.debug(`request :: ${JSON.stringify(req.body)}`)
      // logger.debug(`request :: ${accountData[0].account}`)
    
      bot.sendAccountUpdateMessage(accountData[0].account, description)
      res.status(200).send();
      logger.debug('Got webhook!!')
      // res.send(req.body);
      // res.json({
      //   message: 'Hello World!'
      // })
    })

    this.express.use('/', router)
  }
}

export default new App().express