import { Context } from 'grammy';
import { RecipeStorage } from '../../services/storage.js';

export class SearchHandler {
  private storage: RecipeStorage;

  constructor(storage: RecipeStorage) {
    this.storage = storage;
  }

  /**
   * Handle search command
   */
  async handleSearchCommand(ctx: Context): Promise<void> {
    const message = ctx.message?.text;
    if (!message) return;

    // Extract search query from command
    const match = message.match(/\/search\s+(.+)/);
    if (!match || !match[1]) {
      await ctx.reply('Please provide a search query. Usage: /search <query>');
      return;
    }

    const query = match[1].trim();

    // Search for recipes
    const results = await this.storage.search({ query });

    if (results.length === 0) {
      await ctx.reply(`🔍 No recipes found for "${query}".\n\nTry a different search term or add more recipes with /recipe <youtube_url>.`);
      return;
    }

    // Format and send results
    await this.sendSearchResults(ctx, query, results);
  }

  /**
   * Send formatted search results
   */
  private async sendSearchResults(ctx: Context, query: string, results: any[]): Promise<void> {
    const header = `🔍 Found ${results.length} recipe${results.length > 1 ? 's' : ''} for "${query}":\n\n`;

    const recipes = results.map((recipe, index) => {
      const languageEmoji = recipe.originalLanguage === 'en' ? '🇬🇧' : '🇷🇺';
      return `${index + 1}. <b>${recipe.name}</b> ${languageEmoji}\n` +
             `   ⏱️ ${recipe.cookingTime}\n` +
             `   📝 ${recipe.ingredients.length} ingredient${recipe.ingredients.length > 1 ? 's' : ''}\n` +
             `   🆔 <code>${recipe.id}</code>`;
    }).join('\n\n');

    const footer = '\n\n💡 Use /recipe [youtube_url] to add more recipes.';

    await ctx.reply(header + recipes + footer, { parse_mode: 'HTML' });
  }
}
