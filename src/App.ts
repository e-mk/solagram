import * as express from 'express'

class App {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    this.express.use(express.json());

    const router = express.Router()
    router.post('/', (req, res) => {
      let accountData = req.body[0].accountData
      // console.log(`request :: ${JSON.stringify(req.body)}`)
      console.log(`request :: ${accountData[0].account}`)
    
      res.send(req.body);
      console.log('Got webhook!!')
      // res.json({
      //   message: 'Hello World!'
      // })
    })
    this.express.use('/', router)
  }
}

export default new App().express