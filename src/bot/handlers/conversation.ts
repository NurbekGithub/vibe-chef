import { Bot } from 'grammy';
import type { StorageService } from '../../types';
import type { ZaiAIService } from '../../services/ai';
import { createCategoryKeyboard } from '../keyboards/inline';

export function setupConversation(bot: Bot, storage: StorageService, aiService: ZaiAIService) {
  // Handle text messages (ingredients)
  bot.on('message:text', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const session = (ctx as any).session;
    const text = ctx.message.text;
    
    // Check if it's a command
    if (text.startsWith('/')) {
      return; // Let command handler handle it
    }
    
    switch (session.state) {
      case 'idle':
        await handleNewIngredients(ctx, session, text, storage, aiService);
        break;
        
      case 'adding_title':
        await handleTitleInput(ctx, session, text, storage, aiService);
        break;
        
      default:
        await ctx.reply('Please complete the current operation or use /cancel to start over.');
    }
  });
}

async function handleNewIngredients(
  ctx: any,
  session: any,
  text: string,
  storage: StorageService,
  aiService: ZaiAIService
) {
  // Parse ingredients from text
  const ingredientLines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  if (ingredientLines.length === 0) {
    await ctx.reply('Please provide at least one ingredient.');
    return;
  }
  
  await ctx.reply('🔄 Analyzing ingredients...');
  
  // Classify ingredients with AI
  const classification = await aiService.classifyIngredients({ ingredients: ingredientLines });
  
  // Update session
  session.state = 'selecting_category';
  session.classifiedIngredients = classification.ingredients;
  session.currentRecipe = {
    ingredients: classification.ingredients,
    userId: ctx.from.id,
    createdAt: new Date(),
  };
  
  // Display classified ingredients
  let message = '🥘 *Ingredients classified:*\n\n';
  classification.ingredients.forEach((ing: any, index: number) => {
    message += `${index + 1}. ${ing.name}`;
    if (ing.classification) {
      message += ` (${ing.classification})`;
    }
    message += '\n';
  });
  
  message += '\nPlease select a category for this recipe:';
  
  // Show category keyboard
  const keyboard = createCategoryKeyboard();
  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
}

async function handleTitleInput(
  ctx: any,
  session: any,
  text: string,
  storage: StorageService,
  aiService: ZaiAIService
) {
  const title = text.trim();
  
  if (title.length === 0) {
    await ctx.reply('Please provide a title or use /cancel to cancel.');
    return;
  }
  
  session.currentRecipe.title = title;
  session.state = 'adding_photo';
  
  await ctx.reply(`📸 Great! Title set to: "${title}"\n\nYou can now attach a photo (optional) or send /skip to finish.`);
}
