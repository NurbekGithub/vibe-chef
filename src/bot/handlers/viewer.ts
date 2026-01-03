import { Bot } from 'grammy';
import type { StorageService } from '../../types';
import type { ZaiAIService } from '../../services/ai';

export function setupViewer(bot: Bot, storage: StorageService, aiService: ZaiAIService) {
  // Handle callback queries from inline keyboards
  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from?.id;
    
    if (!userId) return;
    
    // Handle category selection
    if (data.startsWith('category_')) {
      await handleCategorySelection(ctx, data, storage, aiService);
      return;
    }
    
    // Handle recipe actions
    if (data.startsWith('view_')) {
      await handleViewRecipe(ctx, data, storage, aiService);
      return;
    }
    
    if (data.startsWith('delete_')) {
      await handleDeleteRecipe(ctx, data, storage);
      return;
    }
    
    // Handle confirmations
    if (data === 'confirm_yes') {
      await handleConfirmYes(ctx, storage);
      return;
    }
    
    if (data === 'confirm_no') {
      await handleConfirmNo(ctx, storage);
      return;
    }
    
    await ctx.answerCallbackQuery();
  });
}

async function handleCategorySelection(
  ctx: any,
  data: string,
  storage: StorageService,
  aiService: ZaiAIService
) {
  const category = data.replace('category_', '');
  const session = (ctx as any).session;
  
  // Update recipe category
  session.currentRecipe.category = category;
  session.state = 'adding_title';
  
  // Suggest title based on ingredients
  const ingredientNames = session.classifiedIngredients.map((i: any) => i.name);
  const suggestedTitle = await aiService.suggestTitle(ingredientNames);
  
  await ctx.answerCallbackQuery();
  
  let message = `📂 Category: ${category}\n\n`;
  
  if (suggestedTitle && suggestedTitle !== 'Untitled Recipe') {
    message += `💡 Suggested title: "${suggestedTitle}"\n\n`;
    message += `You can:\n`;
    message += `• Type your own title\n`;
    message += `• Send "use suggestion" to use the suggested title\n`;
  } else {
    message += `Please provide a title for your recipe:`;
  }
  
  await ctx.editMessageText(message);
}

async function handleViewRecipe(
  ctx: any,
  data: string,
  storage: StorageService,
  aiService: ZaiAIService
) {
  const recipeId = data.replace('view_', '');
  const userId = ctx.from?.id;
  
  if (!userId) return;
  
  const recipe = await storage.getRecipe(recipeId);
  
  if (!recipe) {
    await ctx.answerCallbackQuery({ text: 'Recipe not found' });
    return;
  }
  
  if (recipe.userId !== userId) {
    await ctx.answerCallbackQuery({ text: 'Access denied' });
    return;
  }
  
  await ctx.answerCallbackQuery();
  
  // Format and display recipe
  const formatted = await aiService.formatRecipe({ recipe });
  
  if (recipe.photo) {
    await ctx.replyWithPhoto(recipe.photo.fileId, {
      caption: formatted.formattedText,
      parse_mode: 'Markdown',
    });
  } else {
    await ctx.reply(formatted.formattedText, { parse_mode: 'Markdown' });
  }
}

async function handleDeleteRecipe(
  ctx: any,
  data: string,
  storage: StorageService
) {
  const recipeId = data.replace('delete_', '');
  const userId = ctx.from?.id;
  
  if (!userId) return;
  
  const recipe = await storage.getRecipe(recipeId);
  
  if (!recipe) {
    await ctx.answerCallbackQuery({ text: 'Recipe not found' });
    return;
  }
  
  if (recipe.userId !== userId) {
    await ctx.answerCallbackQuery({ text: 'Access denied' });
    return;
  }
  
  // Store recipe ID in session for confirmation
  const session = storage.getSession(userId);
  if (session) {
    (session as any).pendingDelete = recipeId;
    storage.setSession(userId, session);
  }
  
  await ctx.answerCallbackQuery();
  await ctx.reply(`⚠️ Are you sure you want to delete "${recipe.title}"?`);
}

async function handleConfirmYes(ctx: any, storage: StorageService) {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  const session = storage.getSession(userId);
  if (!session || !(session as any).pendingDelete) {
    await ctx.answerCallbackQuery({ text: 'No pending deletion' });
    return;
  }
  
  const recipeId = (session as any).pendingDelete;
  
  try {
    await storage.deleteRecipe(recipeId);
    (session as any).pendingDelete = undefined;
    storage.setSession(userId, session);
    
    await ctx.answerCallbackQuery({ text: 'Recipe deleted' });
    await ctx.reply('✅ Recipe deleted successfully.');
  } catch (error) {
    await ctx.answerCallbackQuery({ text: 'Failed to delete recipe' });
  }
}

async function handleConfirmNo(ctx: any, storage: StorageService) {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  const session = storage.getSession(userId);
  if (session) {
    (session as any).pendingDelete = undefined;
    storage.setSession(userId, session);
  }
  
  await ctx.answerCallbackQuery({ text: 'Deletion cancelled' });
  await ctx.reply('✅ Deletion cancelled.');
}
