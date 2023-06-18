export interface ChatAccounts {
  id: string
  accounts: {
    pubKey: string
    name: string
  } []
}

export interface ChatData {
  chatAccounts: ChatAccounts[]
}