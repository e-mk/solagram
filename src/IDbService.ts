import { Account } from "./entity.js"

export interface IDbService {
  getAccountsByChatId(chatId: string): Promise<Map<string, string>>
  getAllAccounts(): Promise<Map<string, Map<string, string>>>
  saveAccount(chatId: string, pubKey: string): [Account, boolean]
  deleteAccount(chatId: string, pubKey: string): [Account, boolean]
}