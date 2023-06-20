import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs';
import { ChatData , ChatAccounts, Account} from './entity.js';
import { IDbService } from './IDbService.js';
import { generateRandomString } from './solHelper.js';
import logger from './logger.js';

class LowDbService implements IDbService {
  private db: Low<ChatData>;

  constructor () {
    this.initDb()
  }

  private async initDb() {
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const dbPath = __dirname.substring(0, __dirname.lastIndexOf("/") + 1) + '/db';
    const file = join(dbPath, 'db.json')

    if (!fs.existsSync(file)) {
      await this.createDbDir(dbPath)
    }

    console.log(file)
    const account = {pubKey: "pubKey0", name: "DDD"}
    const chatInfo0: ChatAccounts = {id: "chatId0", accounts: [account]}
    const defaultData: ChatData = {chatAccounts: [chatInfo0]}
    const adapter = new JSONFile<ChatData>(file)
    this.db = new Low(adapter, defaultData)

    await this.db.read()
    logger.debug(this.db.data)
  }

  private async createDbDir(dbPath: string): Promise<string> {
    await fs.promises.mkdir(dbPath, { recursive: true }).catch(console.error);
    return dbPath
  }

  public async getAccountsByChatId(chatId: string): Promise<Map<string, string>> {
    logger.debug(`getAccountsByChatId : ${chatId}`)
    const chatIdToAccountToNameMap = await this.findAllAccounts()
    return chatIdToAccountToNameMap.get(chatId)
  }

  public async getAllAccounts(): Promise<Map<string, Map<string, string>>> {
    logger.debug(`getAllAccounts`)
    return await this.findAllAccounts()
  }

  public saveAccount(chatId: string, accountPubKey: string): [Account, boolean] {
    logger.debug(`saveAccount :: chatId : ${chatId}, accountPubKey : ${accountPubKey}`)
    const [account, isAdded] = this.saveAccountForChat(chatId, accountPubKey)
    this.db.write()
    return [account, isAdded]
  }
 
  public deleteAccount(chatId: string, accountPubKey: string): [Account, boolean] {
    logger.debug(`saveAccount :: chatId : ${chatId}, accountPubKey : ${accountPubKey}`)
    const [account, isAdded] = this.deleteAccountForChat(chatId, accountPubKey)
    this.db.write()
    return [account, isAdded]
  }

  private async findAllAccounts(): Promise<Map<string, Map<string, string>>> {
    await this.db.read()
    const chatIdToAccountToNameMap = new Map<string, Map<string, string>>
    this.db.data.chatAccounts.forEach(chatIdWithAccountList => {
      let chatId = chatIdWithAccountList.id
      let accountToNameMap = new Map<string, string>
      chatIdWithAccountList.accounts.forEach(account => {
        accountToNameMap.set(account.pubKey, account.name)
      })
      chatIdToAccountToNameMap.set(chatId, accountToNameMap)
    })
    return chatIdToAccountToNameMap
  }

  private async save(chatAccounts: ChatAccounts) {
    if (this.db && this.db.data) {
      this.db.data.chatAccounts.push(chatAccounts) 
      console.log(this.db.data)
      await this.db.write()
    } else {
      console.log("No DB Instance")
    }
  }

  private saveAccountForChat(chatId: string, pubKey: string): [Account, boolean] {
    const accountName = `Account ${generateRandomString(5)}`
    let ChatAccounts = this.db.data.chatAccounts.find(chatAccount => chatAccount.id == chatId)
    if (!ChatAccounts) {
      this.db.data.chatAccounts.push({id: chatId, accounts: [{pubKey, name: accountName}]})
      return [{pubKey, name: accountName}, true]
    }
    const account = ChatAccounts.accounts.find(account => account.pubKey == pubKey)
    if (account) {
      return [{pubKey: account.pubKey, name: account.name}, false];
    } else {
      ChatAccounts.accounts.push({pubKey, name: accountName})
      return [{pubKey, name: accountName}, true]
    }
  }

  private deleteAccountForChat(chatId: string, accountPubKey: string): [Account, boolean] {
    let ChatAccounts = this.db.data.chatAccounts.find(chatAccount => chatAccount.id == chatId)
    if (!ChatAccounts) {
      return [undefined, false]
    } 
    const account = ChatAccounts.accounts.find(account => account.pubKey == accountPubKey)
    if (!account) {
      return [undefined, false]
    } else {
      const index = ChatAccounts.accounts.indexOf(account)
      ChatAccounts.accounts.splice(index, 1);
      return [{  pubKey: account.pubKey, name: account.name}, true]
    }
  }
}

export default new LowDbService()