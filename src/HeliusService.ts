import {
  // enums
  TransactionType,
  WebhookType,
  Address,

  Helius
} from "helius-sdk";

const HELIUS_WEBHOOK_URL = process.env.HELIUS_WEBHOOK_URL
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || "dev"

class HeliusService {
  public helius: Helius
  public network
  
  constructor () {
    this.helius = new Helius(process.env.TG_BOT_TOKEN);
  }

  public async createWebhook(accountAddresses: string[]) {
    let webhooks = await this.helius.getAllWebhooks();
    
    console.log(`request :: ${webhooks.length}`)
    let webhook = webhooks[0]

    const webhookType = (SOLANA_NETWORK === 'main') ? WebhookType.ENHANCED : WebhookType.ENHANCED_DEVNET;
  
    if (!webhook) {
      webhook = await this.helius.createWebhook({
        accountAddresses: accountAddresses,
        transactionTypes: [TransactionType.ANY],
        webhookType: webhookType,
        webhookURL: HELIUS_WEBHOOK_URL
      }); 
    }
    console.log(`webhookID :: ${webhook.webhookID}`)
  }
}

export default new HeliusService().helius