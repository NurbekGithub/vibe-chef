import type { Middleware } from 'grammy';

export function errorHandler(): Middleware {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error('Error in middleware:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      try {
        await ctx.reply(`❌ Что-то пошло не так: ${errorMessage}\n\nПожалуйста, попробуйте снова или используйте /help`);
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  };
}
