import { Bot } from 'grammy';
import type { StorageService } from '../../types';
import type { ZaiAIService } from '../../services/ai';

export function setupCommands(bot: Bot, storage: StorageService, aiService: ZaiAIService) {
  // /start command
  bot.command('start', async (ctx) => {
    const welcomeMessage = `
👋 Добро пожаловать в *Telegram Chef*!

Я ваш личный организатор рецептов. Вот что я умею:

• Отправьте мне ингредиенты, и я помогу их организовать
• Прикрепляйте фото к вашим рецептам
• Я автоматически классифицирую и категоризирую ваши рецепты
• Просматривайте все ваши рецепты в любое время

*Как начать:*
Просто начните вводить ингредиенты или используйте /help для получения дополнительной информации!
    `.trim();
    
    await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
  });
  
  // /help command
  bot.command('help', async (ctx) => {
    const helpMessage = `
📚 *Помощь и команды*

*Команды:*
/start - Запустить бота и увидеть приветственное сообщение
/help - Показать это справочное сообщение
/myrecipes - Просмотреть все ваши рецепты
/recipe <id> - Просмотреть конкретный рецепт
/cancel - Отменить текущую операцию

*Как добавить рецепт:*
1. Отправьте мне ингредиенты в виде текста
2. Я классифицирую их и предложу категорию
3. Выберите категорию из встроенных кнопок
4. Укажите название (или примите мое предложение)
5. Прикрепите фото (необязательно)
6. Ваш рецепт сохранен!

*Советы:*
• Вы можете отправлять ингредиенты в любом формате
• Фото необязательно, но рекомендуется
• Используйте /cancel, чтобы начать заново в любое время
    `.trim();
    
    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  });
  
  // /myrecipes command
  bot.command('myrecipes', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const recipes = await storage.getUserRecipes(userId);
    
    if (recipes.length === 0) {
      await ctx.reply('📭 У вас пока нет рецептов.\n\nНачните с отправки мне ингредиентов!');
      return;
    }
    
    let message = `📖 *Ваши рецепты (${recipes.length})*\n\n`;
    
    recipes.forEach((recipe, index) => {
      message += `${index + 1}. ${recipe.title}\n`;
      message += `   📂 ${recipe.category}\n`;
      message += `   🆔 ${recipe.id}\n\n`;
    });
    
    message += 'Используйте /recipe <id> для просмотра конкретного рецепта';
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
  });
  
  // /recipe command
  bot.command('recipe', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const recipeId = ctx.match;
    
    if (!recipeId) {
      await ctx.reply('Пожалуйста, укажите ID рецепта: /recipe <id>');
      return;
    }
    
    const recipe = await storage.getRecipe(recipeId);
    
    if (!recipe) {
      await ctx.reply('❌ Рецепт не найден. Используйте /myrecipes для просмотра ваших рецептов.');
      return;
    }
    
    if (recipe.userId !== userId) {
      await ctx.reply('❌ Вы можете просматривать только свои рецепты.');
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
      await ctx.reply('ℹ️ Нет активной операции для отмены.');
      return;
    }
    
    storage.clearSession(userId);
    await ctx.reply('✅ Операция отменена. Отправьте мне ингредиенты, чтобы начать новый рецепт!');
  });
}
