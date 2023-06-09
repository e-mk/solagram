import { Telegraf, Scenes, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { isAccount } from './solHelper';
import { WELCOME_MESSAGE, PROVIDE_ACCOUNT_MESSAGE, NOT_AN_ACCOUNT_MESSAGE, NO_ACCOUNTS_REGISTERED,
  accountCreatedMessage, accountAlreadyExists } from './Texts';

import helius from './HeliusService'

require('dotenv').config();

const { enter, leave } = Scenes.Stage;
const ADD_ACCOUNT_SCENE = "addAccountScene"

class Bot {
  public bot: Telegraf<Scenes.SceneContext<Scenes.SceneSessionData>>
  private accountMap = new Map<string, string>();
  private accountNumber = 0

  constructor () {
    this.bot = new Telegraf<Scenes.SceneContext>(process.env.TG_BOT_TOKEN);
    this.initBot()
  }

  private initBot (): void {
    const askAccountScene = new Scenes.BaseScene<Scenes.SceneContext>(ADD_ACCOUNT_SCENE);
    askAccountScene.enter(ctx => ctx.reply(PROVIDE_ACCOUNT_MESSAGE));
    askAccountScene.leave(ctx => ctx.reply("Done!"));
    askAccountScene.command("back", leave<Scenes.SceneContext>());
    askAccountScene.on(message('text'), ctx => this.processAccountPubKey(ctx.message.text, ctx));
    askAccountScene.on("message", ctx => ctx.reply(NOT_AN_ACCOUNT_MESSAGE));

    const stage = new Scenes.Stage<Scenes.SceneContext>([askAccountScene]);
    this.bot.use(session());
    this.bot.use(stage.middleware());

    this.bot.start((ctx) => this.start(ctx));
    this.bot.command('addaccount', (ctx) => ctx.scene.enter(ADD_ACCOUNT_SCENE))
    this.bot.command('accounts', (ctx) => this.listAccounts(ctx))
    this.bot.command('deleteaccount', (ctx) => ctx.reply('Not Implemented'))

    this.bot.help((ctx) => ctx.reply('Send me a sticker'));
    this.bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));

    this.bot.launch();
    
    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  private start = function(ctx) {
    ctx.reply(WELCOME_MESSAGE)
  }

  private processAccountPubKey(pubKey: string, ctx) {
    const [accountName, isAdded] = this.saveAccountToMap(pubKey, ctx)
    if (!pubKey || !accountName) {
      ctx.reply(NOT_AN_ACCOUNT_MESSAGE);
      return
    }

    if (isAdded) {
      helius.createOrUpdateWebhook(Array.from(this.accountMap.keys()))
      ctx.reply(accountCreatedMessage(pubKey, accountName))
    } else{
      ctx.reply(accountAlreadyExists(pubKey, accountName));
    }

    ctx.scene.leave();
  }

  private listAccounts = (ctx) => {
    if (this.accountMap.size == 0) {
      ctx.reply(NO_ACCOUNTS_REGISTERED);
    } else {
      let accountsStr = ""
      for (let [key, value] of this.accountMap) {
        accountsStr = accountsStr.concat(`${value} : ${key}\n`)
      }
      ctx.reply(accountsStr + " ")
    }
  }

  private deleteAccount = (ctx) => {
    const [cmd, param] = (ctx.message.reply_to_message || ctx.message).text.split(' ');
    console.log(cmd, param);
    if (!param) {
      ctx.reply(PROVIDE_ACCOUNT_MESSAGE);
    } 
  }

  private saveAccountToMap(pubKey: string, ctx): [string, boolean] {
    if (!isAccount(pubKey)) {
      return [null, false]
    }
    if (this.accountMap.has(pubKey)) {
      const accountName = this.accountMap.get(pubKey)
      return [accountName, false];
    }
    const accountName = `Account${++this.accountNumber}`
    this.accountMap.set(pubKey, accountName)
    return [accountName, true]
  }
}

export default new Bot().bot