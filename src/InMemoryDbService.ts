
import { IDbService } from './IDbService.js';
import { Account } from './entity.js';

// for testing
class InMemoryDb implements IDbService {

  private chatIdToAccountToNameMap = new Map<string, Map<string, string>> 
  private accountNumber = 0

  public getAccountsByChatId(chatId: string): Promise<Map<string, string>>  {
    return Promise.resolve(this.chatIdToAccountToNameMap.get(chatId));
  }

  public getAllAccounts(): Promise<Map<string, Map<string, string>>>  {
    return Promise.resolve(this.chatIdToAccountToNameMap);
  }

  public saveAccount(chatId: string, pubKey: string): [Account, boolean] {
    let accountMap = this.chatIdToAccountToNameMap.get(chatId)

    if (accountMap && accountMap.has(pubKey)) {
      const accountName = accountMap.get(pubKey)
      return [{pubKey, name: accountName}, false];
    }

    if (!accountMap) {
      accountMap = new Map<string, string>();
    }

    const accountName = `Account${++this.accountNumber}`
    accountMap.set(pubKey, accountName)
    this.chatIdToAccountToNameMap.set(chatId, accountMap)
    return [{pubKey, name: accountName}, true]
  }

  public deleteAccount(chatId: string, pubKey: string): [Account, boolean] {
    let accountMap = this.chatIdToAccountToNameMap.get(chatId)

    if (accountMap && accountMap.has(pubKey)) {
      const accountName = accountMap.get(pubKey)
      const isDeleted = accountMap.delete(pubKey)
      this.chatIdToAccountToNameMap.set(chatId, accountMap)
      return [{pubKey, name: accountName}, isDeleted];
    } else {
      return [undefined, false]
    }
  }

}

export default new InMemoryDb();