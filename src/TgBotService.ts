import { Telegraf, Scenes, session } from 'telegraf';
import { message } from 'telegraf/filters';

import { isAccount } from './solHelper.js';
import helius from './HeliusService.js'
import logger from './logger.js'
import db from './AccountDbService.js'
import { WELCOME_MESSAGE, PROVIDE_ACCOUNT_MESSAGE_TO_MONITOR, PROVIDE_ACCOUNT_MESSAGE_TO_DELETE, 
  NOT_AN_ACCOUNT_MESSAGE, NO_ACCOUNTS_REGISTERED,
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
  // private accountMap = new Map<string, string>();
  private chatIdToAccountToNameMap = new Map<string, Map<string, string>> 
  private accountNumber = 0
  // private senderId = ""

  constructor () {
    this.bot = new Telegraf<Scenes.SceneContext>(process.env.TG_BOT_TOKEN);
    this.initBot()
  }

  private initBot(): void {
    const addAccountScene = new Scenes.BaseScene<Scenes.SceneContext>(ADD_ACCOUNT_SCENE);
    addAccountScene.enter(ctx => ctx.reply(PROVIDE_ACCOUNT_MESSAGE_TO_MONITOR));
    addAccountScene.leave(ctx => ctx.reply("Done!"));
    addAccountScene.command("back", leave<Scenes.SceneContext>());
    addAccountScene.on(message('text'), ctx => this.processAccountPubKey(ctx.message.text, ActionType.ADD, ctx));
    addAccountScene.on("message", ctx => ctx.reply(NOT_AN_ACCOUNT_MESSAGE));
    
    const deleteAccountScene = new Scenes.BaseScene<Scenes.SceneContext>(DELETE_ACCOUNT_SCENE);
    deleteAccountScene.enter(ctx => ctx.reply(PROVIDE_ACCOUNT_MESSAGE_TO_DELETE));
    deleteAccountScene.leave(ctx => ctx.reply("Done!"));
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

        const [accountName, isAdded] = this.saveAccountToMap(pubKey, ctx.message.chat.id)
        let accountMap = this.chatIdToAccountToNameMap.get(ctx.message.chat.id)

        if (isAdded) {
          helius.createOrUpdateWebhook(Array.from(accountMap.keys()))
          logger.info(`added account for chat with Id: ${ctx.message.chat.id}`)
          ctx.reply(accountCreatedMessage(pubKey, accountName))
        } else {
          ctx.reply(accountAlreadyExists(pubKey, accountName));
        }

        break; 
      } 
      case ActionType.DELETE: { 
        const [accountName, isDeleted] = this.deleteAccountFromMap(pubKey, ctx.message.chat.id)
        let accountMap = this.chatIdToAccountToNameMap.get(ctx.message.chat.id)

        if (isDeleted) {
          helius.createOrUpdateWebhook(Array.from(accountMap.keys()))
          ctx.reply(accountDeletedMessage(pubKey, accountName))
        } else {
          ctx.reply(accountNotExist(pubKey, accountName));
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
    let accountMap = this.chatIdToAccountToNameMap.get(ctx.message.chat.id)

    if (!accountMap || accountMap.size == 0) {
      ctx.reply(NO_ACCOUNTS_REGISTERED);
    } else {
      let accountsStr = ""
      for (let [key, value] of accountMap) {
        accountsStr = accountsStr.concat(`${value} : ${key}\n`)
      }
      ctx.reply(accountsStr + " ")
    }
  }

  private saveAccountToMap(pubKey: string, chatId: string): [string, boolean] {
    let accountMap = this.chatIdToAccountToNameMap.get(chatId)

    if (accountMap && accountMap.has(pubKey)) {
      const accountName = accountMap.get(pubKey)
      return [accountName, false];
    }

    if (!accountMap) {
      accountMap = new Map<string, string>();
    }

    const accountName = `Account${++this.accountNumber}`
    accountMap.set(pubKey, accountName)
    this.chatIdToAccountToNameMap.set(chatId, accountMap)
    return [accountName, true]
  }

  private deleteAccountFromMap(pubKey: string, chatId: string): [string, boolean] {
    let accountMap = this.chatIdToAccountToNameMap.get(chatId)

    if (accountMap && accountMap.has(pubKey)) {
      const accountName = accountMap.get(pubKey)
      const isDeleted = accountMap.delete(pubKey)
      this.chatIdToAccountToNameMap.set(chatId, accountMap)
      return [accountName, isDeleted];
    } else {
      return ["", false]
    }
  }

  private sendMessageToChat(chatId: string, msg: string) {
    this.bot.telegram.sendMessage(chatId, msg)
  }

  public sendAccountUpdateMessage(accountPubKey: string, msg: string) {
    let isMessageSent: boolean = false
    for (let [chatId, AccountMap] of this.chatIdToAccountToNameMap) { 
      if (AccountMap.has(accountPubKey)) {
        this.sendMessageToChat(chatId, msg)
        isMessageSent = true
      }
    } 
    if (isMessageSent) {
      logger.debug("Update Sent")
    }
  }
}

export default new Bot()
