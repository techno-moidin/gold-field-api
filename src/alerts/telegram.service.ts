import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Bot, Context } from 'grammy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Bot<Context> | null = null;
  private botToken: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
  }

  onModuleInit() {
    if (!this.botToken || this.botToken === 'your_telegram_bot_token_here') {
      this.logger.warn(
        'Telegram bot token not configured. Set TELEGRAM_BOT_TOKEN in .env to enable bot.',
      );
      return;
    }

    try {
      this.bot = new Bot(this.botToken);
      this.setupCommands();
      this.logger.log('Telegram bot initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Telegram bot', error);
    }
  }

  onModuleDestroy() {
    if (this.bot) {
      void this.bot.stop();
      this.logger.log('Telegram bot stopped');
    }
  }

  private setupCommands() {
    if (!this.bot) return;

    this.bot.command('start', async (ctx) => {
      const welcomeMessage = `
👋 *Welcome to Gold Field Alert Bot!*

Get daily gold price signals and alerts for UAE gold market.

*Commands:*
/subscribe - Subscribe to daily alerts
/unsubscribe - Unsubscribe from alerts
/signal - Get today's signal
/price - Get current 24K gold price
/settings - Update your preferences
/help - Show this help message

⚠️ *Disclaimer:* This is for informational purposes only, not financial advice.
      `;
      await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
    });

    this.bot.command('help', async (ctx) => {
      const helpMessage = `
📖 *Help*

*Available Commands:*
/start - Welcome message
/subscribe - Subscribe to daily alerts
/unsubscribe - Unsubscribe from alerts
/signal - Get today's BUY/WAIT/AVOID signal
/price - Get current 24K gold price in UAE
/settings - Change preferences (region, purity)
/help - Show this help message

*About Signals:*
✅ BUY - Good time to buy
⚠️ WAIT - No clear direction
❌ AVOID - Poor timing

*Contact:* For support, visit our website.
      `;
      await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
    });

    this.bot.command('signal', async (ctx) => {
      await ctx.reply(
        "📊 Fetching today's signal... Use the API endpoint: GET /signals/today",
      );
    });

    this.bot.command('price', async (ctx) => {
      await ctx.reply(
        '💰 Current prices: Use the API endpoint: GET /gold-rates/live',
      );
    });

    this.bot.command('settings', async (ctx) => {
      const settingsMessage = `
⚙️ *Settings*

Coming soon! You can:
- Set preferred region (UAE, India, etc.)
- Set preferred purity (24K, 22K, 18K)
- Choose alert frequency

Use /subscribe to get started with defaults.
      `;
      await ctx.reply(settingsMessage, { parse_mode: 'Markdown' });
    });

    this.bot.command('subscribe', async (ctx) => {
      const chatId = ctx.from?.id.toString();
      if (chatId) {
        await ctx.reply(
          '✅ *Subscribed!* You will receive daily gold signals at 9 AM UAE time.\n\nUse /unsubscribe to stop.',
          { parse_mode: 'Markdown' },
        );
      }
    });

    this.bot.command('unsubscribe', async (ctx) => {
      await ctx.reply(
        '❌ *Unsubscribed.* You will no longer receive alerts.\n\nUse /subscribe to resubscribe.',
        { parse_mode: 'Markdown' },
      );
    });

    this.bot.on('message:text', async (ctx) => {
      await ctx.reply('Send /help to see available commands.');
    });
  }

  async sendMessage(chatId: string, message: string): Promise<boolean> {
    if (!this.bot) {
      this.logger.warn('Bot not initialized, cannot send message');
      return false;
    }

    try {
      await this.bot.api.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message to ${chatId}`, error);
      return false;
    }
  }

  async sendSignal(
    chatId: string,
    signal: {
      signal: string;
      confidence: string;
      reasoning: string;
      price24k: number;
    },
  ): Promise<boolean> {
    const emoji =
      signal.signal === 'BUY' ? '✅' : signal.signal === 'AVOID' ? '❌' : '⚠️';

    const message = `
${emoji} *Gold Signal - ${signal.signal}*

*Confidence:* ${signal.confidence}

💰 *24K Price:* AED ${signal.price24k.toFixed(2)}

📝 *Reasoning:*
${signal.reasoning}

---
⚠️ Not financial advice. Source: Gold Field UAE
    `.trim();

    return this.sendMessage(chatId, message);
  }

  async sendPriceAlert(
    chatId: string,
    priceData: {
      region: string;
      purity: string;
      price: number;
      change: number;
    },
  ): Promise<boolean> {
    const direction = priceData.change >= 0 ? '📈' : '📉';
    const message = `
🔔 *Price Alert*

${priceData.purity} in ${priceData.region}:
*AED ${priceData.price.toFixed(2)}/gram*

${direction} ${priceData.change >= 0 ? '+' : ''}${priceData.change.toFixed(2)}%
    `.trim();

    return this.sendMessage(chatId, message);
  }

  isBotEnabled(): boolean {
    return !!this.bot;
  }

  getBot(): Bot<Context> | null {
    return this.bot;
  }
}
