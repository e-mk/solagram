import { Account } from "./entity.js"

export interface IDbService {
  getAccountsByChatId(chatId: string): Map<string, string>
  getAllAccounts(): Map<string, Map<string, string>>
  saveAccount(chatId: string, pubKey: string): [Account, boolean]
  deleteAccount(chatId: string, pubKey: string): [Account, boolean]
}