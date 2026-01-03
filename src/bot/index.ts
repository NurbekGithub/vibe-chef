import { Bot } from 'grammy';
import { loadConfig } from '../config';
import { InMemoryStorage } from '../services/storage';
import { ZaiAIService } from '../services/ai';
import { setupCommands } from './handlers/commands';
import { setupConversation } from './handlers/conversation';
import { setupPhotos } from './handlers/photos';
import { setupViewer } from './handlers/viewer';
import { sessionMiddleware } from './middleware/session';
import { errorHandler } from './middleware/error';

export async function createBot() {
  const config = loadConfig();
  const storage = new InMemoryStorage();
  const aiService = new ZaiAIService({
    apiKey: config.zaiApiKey,
    apiEndpoint: config.zaiApiEndpoint,
  });
  
  const bot = new Bot(config.telegramBotToken);
  
  // Apply middleware
  bot.use(sessionMiddleware(storage));
  bot.use(errorHandler());
  
  // Setup handlers
  setupCommands(bot, storage, aiService);
  setupConversation(bot, storage, aiService);
  setupPhotos(bot, storage, aiService);
  setupViewer(bot, storage, aiService);
  
  // Error handling
  bot.catch((err) => {
    console.error('Bot error:', err);
  });
  
  return bot;
}
