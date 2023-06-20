export const WELCOME_MESSAGE = "Welcome to Solagram bot. Please use /addaccount to add Solana account to monitor or /accounts to list existing accounts"
export const PROVIDE_ACCOUNT_MESSAGE_TO_MONITOR = "Please, provide the account address you want to monitor"
export const PROVIDE_ACCOUNT_MESSAGE_TO_DELETE = "Please, provide the account address you want to delete"
export const NOT_AN_ACCOUNT_MESSAGE = "Provided public key is not a Solana account"
export const NO_ACCOUNTS_REGISTERED = "No accounts registered for monitoring yet"

export const accountAlreadyExists = (pubKey: string, accountName: string) => `Account with Public key ${pubKey} already exists with name ${accountName}`
export const accountNotExist = (pubKey: string, accountName: string) => `Account with Public key ${pubKey} already exists with name ${accountName}`
export const accountCreatedMessage = (pubKey: string, accountName: string) => `Created Account with name ${accountName} and Public Key ${pubKey}`;
export const accountDeletedMessage = (pubKey: string, accountName: string) => `Deleted Account with name ${accountName} and Public Key ${pubKey}`;