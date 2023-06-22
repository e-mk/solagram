import { Telegraf, Scenes, session } from 'telegraf';
import { message } from 'telegraf/filters';

import { isAccount } from './solHelper.js';
import helius from './HeliusService.js'
import logger from './logger.js'
import db from './AccountDbService.js'
// import db from './InMemoryDbService.js'
import { WELCOME_MESSAGE, PROVIDE_ACCOUNT_MESSAGE_TO_MONITOR, PROVIDE_ACCOUNT_MESSAGE_TO_DELETE, 
  NOT_AN_ACCOUNT_MESSAGE, NO_ACCOUNTS_REGISTERED, BULLISH_MESSAGE,
  accountCreatedMessage, accountDeletedMessage, accountAlreadyExists, accountNotExist } from './Texts.js';


import { ChatAccounts } from './entity.js';
import dotenv from 'dotenv'
dotenv.config()

const { enter, leave } = Scenes.Stage;
const ADD_ACCOUNT_SCENE = "addAccountScene"
const DELETE_ACCOUNT_SCENE = "deleteAccountScene"

enum ActionType {
  ADD,

  DELETE
}

class Bot {
  public bot: Telegraf<Scenes.SceneContext<Scenes.SceneSessionData>>

  constructor () {
    this.bot = new Telegraf<Scenes.SceneContext>(process.env.SOLAGRAM_TG_BOT_TOKEN);
    this.initBot()
  }

  private initBot(): void {
    const addAccountScene = new Scenes.BaseScene<Scenes.SceneContext>(ADD_ACCOUNT_SCENE);
    addAccountScene.enter(ctx => ctx.reply(PROVIDE_ACCOUNT_MESSAGE_TO_MONITOR));
    addAccountScene.leave(ctx => ctx.reply(BULLISH_MESSAGE));
    addAccountScene.command("back", leave<Scenes.SceneContext>());
    addAccountScene.on(message('text'), ctx => this.processAccountPubKey(ctx.message.text, ActionType.ADD, ctx));
    addAccountScene.on("message", ctx => ctx.reply(NOT_AN_ACCOUNT_MESSAGE));
    
    const deleteAccountScene = new Scenes.BaseScene<Scenes.SceneContext>(DELETE_ACCOUNT_SCENE);
    deleteAccountScene.enter(ctx => ctx.reply(PROVIDE_ACCOUNT_MESSAGE_TO_DELETE));
    deleteAccountScene.leave(ctx => ctx.reply(BULLISH_MESSAGE));
    deleteAccountScene.command("back", leave<Scenes.SceneContext>());
    deleteAccountScene.on(message('text'), ctx => this.processAccountPubKey(ctx.message.text, ActionType.DELETE, ctx));
    deleteAccountScene.on("message", ctx => ctx.reply(NOT_AN_ACCOUNT_MESSAGE));

    const stage = new Scenes.Stage<Scenes.SceneContext>([addAccountScene, deleteAccountScene]);
    this.bot.use(session());
    this.bot.use(stage.middleware());

    this.bot.start((ctx) => this.start(ctx));
    this.bot.command('addaccount', (ctx) => ctx.scene.enter(ADD_ACCOUNT_SCENE))
    this.bot.command('accounts', (ctx) => this.listAccounts(ctx))
    this.bot.command('deleteaccount', (ctx) => ctx.scene.enter(DELETE_ACCOUNT_SCENE))

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

  private processAccountPubKey(pubKey: string, action: ActionType, ctx) {
    if (!isAccount(pubKey)) {
      ctx.reply(NOT_AN_ACCOUNT_MESSAGE);
      ctx.scene.leave();
      return
    }

    switch(action) { 
      case ActionType.ADD: {

        if (!pubKey) {
          ctx.reply(NOT_AN_ACCOUNT_MESSAGE);
          ctx.scene.leave();
          return
        }
        const [account, isAdded] = db.saveAccount(ctx.message.chat.id, pubKey)
        let accountMap = db.getAccountsByChatId(ctx.message.chat.id)
        if (isAdded) {
          logger.debug(`account: ${account.pubKey}, ${account.name}`)
          logger.debug(accountMap)
          accountMap.set(account.pubKey, account.name)
          helius.createOrUpdateWebhook(Array.from(accountMap.keys()))
          logger.info(`added account for chat with Id: ${ctx.message.chat.id}`)
          ctx.reply(accountCreatedMessage(pubKey, account.name))
        } else {
          ctx.reply(accountAlreadyExists(pubKey, account.name));
        }

        break; 
      } 
      case ActionType.DELETE: { 
        const [account, isDeleted] = db.deleteAccount(ctx.message.chat.id, pubKey)
        let accountMap = db.getAccountsByChatId(ctx.message.chat.id)
        if (isDeleted) {
          accountMap.delete(account.pubKey)
          helius.createOrUpdateWebhook(Array.from(accountMap.keys()))
          ctx.reply(accountDeletedMessage(pubKey, account.name))
        } else {
          ctx.reply(accountNotExist(pubKey, account.name));
        }
        break; 
      }
      default: { 
        logger.debug("Unknown action");
        ctx.scene.leave(); 
        break; 
     }  
   }

    ctx.scene.leave();
  }

  private listAccounts = (ctx) => {
    const accountToNameMap = db.getAccountsByChatId(ctx.message.chat.id)
    if (!accountToNameMap || accountToNameMap.size == 0) {
      ctx.reply(NO_ACCOUNTS_REGISTERED);
    } else {
      let accountsStr = ""
      for (let [key, value] of accountToNameMap) {
        accountsStr = accountsStr.concat(`${value} : ${key}\n`)
      }
      ctx.reply(accountsStr + " ")
    }
  }

  private sendMessageToChat(chatId: string, msg: string) {
    this.bot.telegram.sendMessage(chatId, msg)
  }

  public sendAccountUpdateMessage(accountPubKeys: string[], msg: string) {
    const chatIdToAccountToNameMap = db.getAllAccounts()
    for (let [chatId, AccountMap] of chatIdToAccountToNameMap) { 
      accountPubKeys.forEach(pubkey => {
        if (AccountMap.has(pubkey)) {
          logger.debug(`Update Sent to chat with ID : ${chatId}`)
          this.sendMessageToChat(chatId, msg)
        }
      })
    } 
  }
}

export default new Bot()
