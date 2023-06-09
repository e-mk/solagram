export const WELCOME_MESSAGE = "Welcome to Solagram bot. Please provide Solana wallet address to monitor"
export const PROVIDE_ACCOUNT_MESSAGE = "Please, provide the account address you want to monitor"
export const NOT_AN_ACCOUNT_MESSAGE = "Provided public key is not a Solana account"
export const NO_ACCOUNTS_REGISTERED = "No accounts registered for monitoring yet"

export const accountAlreadyExists = (pubKey: string, accountName: string) => `Account with Public key ${pubKey} already exists with name ${accountName}`
export const accountCreatedMessage = (pubKey: string, accountName: string) => `Created Account with name ${accountName} and Public Key ${pubKey}`;