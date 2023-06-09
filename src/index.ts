import express from './App'
import bot from './TgBot'

const port = process.env.PORT || 3000
const botWebhookPort = process.env.BOT_WH_PORT || 80

express.listen(port, (err) => {
  if (err) {
    return console.log(err)
  }

  return console.log(`server is listening on ${port}`)
})

async function createTgBotWebhook() {
  const webhookDomain = "http://localhost:80/bot" 
  console.log(`webhookDomain :: ${webhookDomain}`)
  express.use(await bot.createWebhook({ domain: webhookDomain }));
}
