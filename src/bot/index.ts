import { Bot } from 'grammy';
import { RecipeHandler } from './handlers/recipe.js';
import { SearchHandler } from './handlers/search.js';
import { SupadataService } from '../services/supadata.js';
import { AIService } from '../services/ai.js';
import { RecipeStorage } from '../services/storage.js';
import { getConfig } from '../config/index.js';

export async function createBot(): Promise<Bot> {
  // Load configuration
  const config = getConfig();

  // Initialize services
  const supadata = new SupadataService(
    config.supadataApiKey,
    config.supadataApiEndpoint
  );

  const ai = new AIService(
    config.zaiApiKey,
    config.zaiApiEndpoint
  );

  const storage = new RecipeStorage(config.redisUrl);

  // Initialize handlers
  const recipeHandler = new RecipeHandler(supadata, ai, storage);
  const searchHandler = new SearchHandler(storage);

  // Create bot instance
  const bot = new Bot(config.telegramBotToken);

  // Register commands
  bot.command('recipe', (ctx) => recipeHandler.handleRecipeCommand(ctx));
  bot.command('search', (ctx) => searchHandler.handleSearchCommand(ctx));
  bot.command('list', (ctx) => recipeHandler.handleListCommand(ctx));
  bot.command('help', (ctx) => recipeHandler.handleHelpCommand(ctx));
  bot.command('start', (ctx) => recipeHandler.handleHelpCommand(ctx));

  // Handle text messages (recipe IDs or search queries)
  bot.on('message:text', async (ctx) => {
    const text = ctx.message?.text?.trim();
    if (!text) return;

    // Try to find recipe by ID first
    const recipe = await storage.getById(text);
    if (recipe) {
      await recipeHandler.handleRecipeById(ctx, text);
      return;
    }

    // If not a recipe ID, treat as search query
    await searchHandler.handleSearchQuery(ctx, text);
  });

  // Handle errors
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  const recipeCount = await storage.count();

  console.log('✅ Bot initialized successfully');
  console.log(`📦 Storage: ${recipeCount} recipes loaded`);
  console.log(`🔑 Supadata API: ${config.supadataApiEndpoint}`);
  console.log(`🤖 Z.AI API: ${config.zaiApiEndpoint}`);
  console.log(`🔴 Redis: ${config.redisUrl}`);

  return bot;
}
