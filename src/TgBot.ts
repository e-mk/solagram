import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { Update } from 'telegraf/typings/core/types/typegram';
import { WELCOME_MESSAGE } from './Texts';


class Bot {
  public bot: Telegraf<Context<Update>>

  constructor () {
    this.bot = new Telegraf(process.env.BOT_TOKEN || "5994101075:AAEnN403HZ-f9cUrrvb6I9X7IPQjtOmpaRg");
    this.initBot()
  }

  private initBot (): void {
    this.bot.start((ctx) => this.start(ctx));
    this.bot.help((ctx) => ctx.reply('Send me a sticker'));
    this.bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
    this.bot.hears('hi', (ctx) => ctx.reply('Hey there'));
    this.bot.launch();
    
    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  private start = function(ctx: Context) {
    ctx.reply(WELCOME_MESSAGE)
  }
  
}

export default new Bot().bot