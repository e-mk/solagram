import {
  // enums
  TransactionType,
  WebhookType,
  Address,

  Helius
} from "helius-sdk";

require('dotenv').config();

const HELIUS_WEBHOOK_URL = `${process.env.HELIUS_WEBHOOK_URL}/webhook`
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || "dev"

class HeliusService {
  private helius: Helius
  private webhookId: string
  
  constructor () {
    this.helius = new Helius(process.env.HELIUS_API_KEY);
  }

  public createOrUpdateWebhook(accountAddresses: string[]) {
    if (this.webhookId) {
      this.editWebhook(this.webhookId, accountAddresses)
    } else {
      this.createWebhook(accountAddresses)
    }
  }

  private async createWebhook(accountAddresses: string[]) {
    let webhooks = await this.helius.getAllWebhooks();
    
    console.log(`Create Webhook with account addresses :: ${accountAddresses}`)
    console.log(`Create Webhook with url :: ${HELIUS_WEBHOOK_URL}`)
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
    this.webhookId = webhook.webhookID
    console.log(`webhookID :: ${webhook.webhookID}`)
  }

  private async editWebhook(webhookId: string, accountAddresses: string[]) {
    let webhook = await this.helius.getWebhookByID(webhookId);
    console.log(`Edit Webhook with id ${webhookId}`)

    if (webhook) {
      // deleted all accounts
      if (accountAddresses.length == 0) {
        this.helius.deleteWebhook(this.webhookId)
        console.log(`Deleted webhookID :: ${webhook.webhookID}`)
        return
      }

      webhook = await this.helius.editWebhook(
        webhook.webhookID,
        {
        accountAddresses: accountAddresses,
        transactionTypes: [TransactionType.ANY], 
        webhookURL: HELIUS_WEBHOOK_URL
      }); 
      console.log(`Edited webhookID :: ${webhook.webhookID}`)
    } else {
      console.log('no webhook to edit')
    }
  }
}

export default new HeliusService()