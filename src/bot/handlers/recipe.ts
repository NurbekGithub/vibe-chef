import { Bot, Context } from 'grammy';
import { SupadataService, SupadataError } from '../../services/supadata.js';
import { AIService, AIServiceError } from '../../services/ai.js';
import { RecipeStorage } from '../../services/storage.js';
import type { Recipe } from '../../types/recipe.js';

export class RecipeHandler {
  private supadata: SupadataService;
  private ai: AIService;
  private storage: RecipeStorage;

  constructor(
    supadata: SupadataService,
    ai: AIService,
    storage: RecipeStorage
  ) {
    this.supadata = supadata;
    this.ai = ai;
    this.storage = storage;
  }

  /**
   * Handle recipe extraction command
   */
  async handleRecipeCommand(ctx: Context): Promise<void> {
    const message = ctx.message?.text;
    if (!message) return;

    // Extract YouTube URL from command
    const match = message.match(/\/recipe\s+(.+)/);
    if (!match || !match[1]) {
      await ctx.reply('Please provide a YouTube URL. Usage: /recipe <youtube_url>');
      return;
    }

    const youtubeUrl = match[1].trim();

    // Send initial message
    const statusMessage = await ctx.reply('🎬 Processing YouTube video...');

    try {
      // Step 1: Validate YouTube URL
      await ctx.api.editMessageText(
        ctx.chat!.id,
        statusMessage.message_id,
        '✅ Validating YouTube URL...'
      );
      this.supadata.validateYouTubeUrl(youtubeUrl);

      // Step 2: Extract transcript
      await ctx.api.editMessageText(
        ctx.chat!.id,
        statusMessage.message_id,
        '📝 Extracting transcript from video...'
      );

      const transcript = await this.supadata.getPlainTextTranscript(youtubeUrl);

      if (!transcript || transcript.length < 50) {
        throw new Error('Transcript is too short or unavailable');
      }

      // Step 3: Process with AI
      await ctx.api.editMessageText(
        ctx.chat!.id,
        statusMessage.message_id,
        '🤖 Extracting recipe information...'
      );

      const recipe = await this.ai.processRecipe(transcript, youtubeUrl);

      // Step 4: Save to storage
      await this.storage.add(recipe);

      // Step 5: Send formatted recipe
      await ctx.api.deleteMessage(ctx.chat!.id, statusMessage.message_id);
      await this.sendRecipeCard(ctx, recipe);

    } catch (error) {
      // Handle errors
      let errorMessage = '❌ Failed to process recipe.';

      if (error instanceof SupadataError) {
        if (error.statusCode === 404) {
          errorMessage = '❌ Transcript not available for this video.';
        } else {
          errorMessage = `❌ Supadata error: ${error.message}`;
        }
      } else if (error instanceof AIServiceError) {
        errorMessage = `❌ AI processing error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = `❌ Error: ${error.message}`;
      }

      await ctx.api.editMessageText(
        ctx.chat!.id,
        statusMessage.message_id,
        errorMessage
      );
    }
  }

  /**
   * Send formatted recipe card
   */
  private async sendRecipeCard(ctx: Context, recipe: Recipe): Promise<void> {
    const language = recipe.originalLanguage === 'en' ? 'English' : 'Russian';
    const languageEmoji = recipe.originalLanguage === 'en' ? '🇬🇧' : '🇷🇺';

    const message = `
🍽️ <b>${recipe.name}</b>
⏱️ Cooking Time: ${recipe.cookingTime}

📝 <b>Ingredients:</b>
${recipe.ingredients.map(ing => `• ${ing}`).join('\n')}

👨‍🍳 <b>Instructions:</b>
${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

📺 Source: <a href="${recipe.youtubeUrl}">YouTube Video</a>
🌐 Original Language: ${language} ${languageEmoji}
🆔 Recipe ID: <code>${recipe.id}</code>
`.trim();

    await ctx.reply(message, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  }

  /**
   * Handle list command
   */
  async handleListCommand(ctx: Context): Promise<void> {
    const recipes = await this.storage.getAll();

    if (recipes.length === 0) {
      await ctx.reply('📭 No recipes saved yet. Use /recipe [youtube_url] to add one!');
      return;
    }

    const message = `📚 <b>Saved Recipes (${recipes.length})</b>\n\n` +
      recipes.map((recipe, index) => {
        const languageEmoji = recipe.originalLanguage === 'en' ? '🇬🇧' : '🇷🇺';
        return `${index + 1}. <b>${recipe.name}</b> ${languageEmoji}\n` +
               `   ⏱️ ${recipe.cookingTime}\n` +
               `   🆔 <code>${recipe.id}</code>`;
      }).join('\n\n');

    await ctx.reply(message, { parse_mode: 'HTML' });
  }

  /**
   * Handle help command
   */
  async handleHelpCommand(ctx: Context): Promise<void> {
    const helpMessage = `
👨‍🍳 <b>Telegram Chef Bot</b>

<b>Available Commands:</b>

/recipe [youtube_url] - Extract recipe from YouTube video
/search [query] - Search for saved recipes
/list - List all saved recipes
/help - Show this help message

<b>How it works:</b>
1. Send a YouTube recipe video link
2. Bot extracts the transcript
3. AI analyzes and extracts recipe details
4. English recipes are translated to Russian
5. Recipe is saved and displayed

<b>Features:</b>
✅ Automatic recipe extraction
✅ Ingredient and instruction parsing
✅ English to Russian translation
✅ Search by name or ingredients
✅ In-memory storage
    `.trim();

    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
  }
}
