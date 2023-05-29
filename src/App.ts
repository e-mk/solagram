import * as express from 'express'

class App {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    router.post('/', (req, res) => {
      res.send("AAA")
      // res.json({
      //   message: 'Hello World!'
      // })
    })
    this.express.use('/', router)
  }
}

export default new App().express