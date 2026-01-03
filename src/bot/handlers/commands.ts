import { Bot } from 'grammy';
import type { StorageService } from '../../types';
import type { ZaiAIService } from '../../services/ai';

export function setupCommands(bot: Bot, storage: StorageService, aiService: ZaiAIService) {
  // /start command
  bot.command('start', async (ctx) => {
    const welcomeMessage = `
👋 Welcome to *Telegram Chef*!

I'm your personal recipe organizer. Here's what I can do:

• Send me ingredients and I'll help organize them
• Attach photos to your recipes
• I'll classify and categorize your recipes automatically
• View all your recipes anytime

*Getting Started:*
Just start typing your ingredients or use /help for more information!
    `.trim();
    
    await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
  });
  
  // /help command
  bot.command('help', async (ctx) => {
    const helpMessage = `
📚 *Help & Commands*

*Commands:*
/start - Start the bot and see welcome message
/help - Show this help message
/myrecipes - View all your recipes
/recipe <id> - View a specific recipe
/cancel - Cancel current operation

*How to add a recipe:*
1. Send me your ingredients as text
2. I'll classify them and suggest a category
3. Select a category from the inline buttons
4. Provide a title (or accept my suggestion)
5. Attach a photo (optional)
6. Your recipe is saved!

*Tips:*
• You can send ingredients in any format
• Photos are optional but recommended
• Use /cancel to start over anytime
    `.trim();
    
    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  });
  
  // /myrecipes command
  bot.command('myrecipes', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const recipes = await storage.getUserRecipes(userId);
    
    if (recipes.length === 0) {
      await ctx.reply('📭 You don\'t have any recipes yet.\n\nStart by sending me some ingredients!');
      return;
    }
    
    let message = `📖 *Your Recipes (${recipes.length})*\n\n`;
    
    recipes.forEach((recipe, index) => {
      message += `${index + 1}. ${recipe.title}\n`;
      message += `   📂 ${recipe.category}\n`;
      message += `   🆔 ${recipe.id}\n\n`;
    });
    
    message += 'Use /recipe <id> to view a specific recipe';
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
  });
  
  // /recipe command
  bot.command('recipe', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const recipeId = ctx.match;
    
    if (!recipeId) {
      await ctx.reply('Please provide a recipe ID: /recipe <id>');
      return;
    }
    
    const recipe = await storage.getRecipe(recipeId);
    
    if (!recipe) {
      await ctx.reply('❌ Recipe not found. Use /myrecipes to see your recipes.');
      return;
    }
    
    if (recipe.userId !== userId) {
      await ctx.reply('❌ You can only view your own recipes.');
      return;
    }
    
    // Format and display recipe
    const formatted = await aiService.formatRecipe({ recipe });
    await ctx.reply(formatted.formattedText, { parse_mode: 'Markdown' });
  });
  
  // /cancel command
  bot.command('cancel', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const session = storage.getSession(userId);
    
    if (!session || session.state === 'idle') {
      await ctx.reply('ℹ️ No active operation to cancel.');
      return;
    }
    
    storage.clearSession(userId);
    await ctx.reply('✅ Operation cancelled. Send me some ingredients to start a new recipe!');
  });
}
