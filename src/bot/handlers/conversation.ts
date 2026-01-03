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
        await ctx.reply('Пожалуйста, завершите текущую операцию или используйте /cancel, чтобы начать заново.');
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
    await ctx.reply('Пожалуйста, укажите хотя бы один ингредиент.');
    return;
  }
  
  await ctx.reply('🔄 Анализ ингредиентов...');
  
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
  let message = '🥘 *Ингредиенты классифицированы:*\n\n';
  classification.ingredients.forEach((ing: any, index: number) => {
    message += `${index + 1}. ${ing.name}`;
    if (ing.classification) {
      message += ` (${ing.classification})`;
    }
    message += '\n';
  });
  
  message += '\nПожалуйста, выберите категорию для этого рецепта:';
  
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
    await ctx.reply('Пожалуйста, укажите название или используйте /cancel для отмены.');
    return;
  }
  
  // Check if user wants to use the suggested title
  if (title.toLowerCase() === 'use suggestion' || title.toLowerCase() === 'использовать предложение') {
    const ingredientNames = session.classifiedIngredients.map((i: any) => i.name);
    const suggestedTitle = await aiService.suggestTitle(ingredientNames);
    session.currentRecipe.title = suggestedTitle;
  } else {
    session.currentRecipe.title = title;
  }
  
  session.state = 'adding_photo';
  
  await ctx.reply(`📸 Отлично! Название установлено: "${session.currentRecipe.title}"\n\nТеперь вы можете прикрепить фото (необязательно) или отправить /skip для завершения.`);
}
