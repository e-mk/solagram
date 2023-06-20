export interface Account {
  pubKey: string
  name: string
}

export interface ChatAccounts {
  id: string
  accounts: Account []
}

export interface ChatData {
  chatAccounts: ChatAccounts[]
}