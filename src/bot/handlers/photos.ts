import { Bot } from 'grammy';
import type { StorageService } from '../../types';
import type { ZaiAIService } from '../../services/ai';

export function setupPhotos(bot: Bot, storage: StorageService, aiService: ZaiAIService) {
  // Handle photo messages
  bot.on('message:photo', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const session = (ctx as any).session;
    
    // Only accept photos when adding a recipe
    if (session.state !== 'adding_photo') {
      await ctx.reply('ℹ️ Пожалуйста, начните с отправки ингредиентов.');
      return;
    }
    
    const photo = ctx.message.photo?.[ctx.message.photo.length - 1]; // Get largest photo
    
    if (!photo) {
      await ctx.reply('❌ Не удалось обработать фото. Пожалуйста, попробуйте снова.');
      return;
    }
    
    // Store photo info
    session.currentRecipe.photo = {
      fileId: photo.file_id,
      fileUniqueId: photo.file_unique_id,
      width: photo.width,
      height: photo.height,
    };
    
    await finalizeRecipe(ctx, session, storage, aiService);
  });
  
  // Handle /skip command for photos
  bot.command('skip', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const session = (ctx as any).session;
    
    if (session.state !== 'adding_photo') {
      return; // Not in photo state
    }
    
    await finalizeRecipe(ctx, session, storage, aiService);
  });
}

async function finalizeRecipe(
  ctx: any,
  session: any,
  storage: StorageService,
  aiService: ZaiAIService
) {
  // Generate recipe ID using Bun's crypto
  const recipeId = crypto.randomUUID();
  
  // Complete recipe object
  const recipe = {
    ...session.currentRecipe,
    id: recipeId,
    userId: ctx.from.id,
    updatedAt: new Date(),
  };
  
  // Save recipe
  await storage.saveRecipe(recipe);
  
  // Clear session
  storage.clearSession(ctx.from.id);
  
  // Format and display recipe
  const formatted = await aiService.formatRecipe({ recipe });
  
  await ctx.reply('✅ Рецепт успешно сохранен!\n\n');
  
  // Send photo if exists
  if (recipe.photo) {
    await ctx.replyWithPhoto(recipe.photo.fileId, {
      caption: formatted.formattedText,
      parse_mode: 'Markdown',
    });
  } else {
    await ctx.reply(formatted.formattedText, { parse_mode: 'Markdown' });
  }
  
  await ctx.reply('\nОтправьте мне больше ингредиентов, чтобы добавить еще один рецепт!');
}
