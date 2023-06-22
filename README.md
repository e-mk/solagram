# Solagram

Solagram is a telegram bot that enables you to stay up-to-date with the activities happening on the Solana network. By leveraging the capabilities of this bot, you can receive real-time updates and notifications on registered Solana accounts directly on your Telegram chat. [Helius](https://www.helius.dev/) webhooks are used for monitoring Solana network.

You can launch your own bot or use an existing one by adding [SolagramBot](https://t.me/SolagramBot) to your telegram.

## Getting Started

1. Install the dependencies:
   
    ```sh
    npm install
    ```
2. Set up the configuration file:
    
    > Create `.env` file with the following variables:
    
    ```dosini
    SOLAGRAM_TG_BOT_TOKEN=<Your Telegram bot token>
    SOLAGRAM_HELIUS_API_KEY=<Helius API key>
    SOLAGRAM_HELIUS_WEBHOOK_URL=<Your application API URL to send webhooks>
    SOLAGRAM_SOLANA_NETWORK=<Solana network to operate in (dev | test | main)>
    SOLAGRAM_LOG_LEVEL=<Log level>
    SOLAGRAM_DB_PATH=<The path to the db>
    ```
3. Build
    ```sh
    npm run build
    ```
4. Run 
 + in Development environment
   ```sh
   npm run dev
   ```
 + in Development environment
   ```sh
   npm run start
   ```
## Usage

To use the Telegram bot, follow these steps:

1. Start a chat with your bot on Telegram.
2. Register a Solana account by sending the `/addaccount` command.
3. Receive updates on registered accounts whenever an event occurs on the Solana network.



