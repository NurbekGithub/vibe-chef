# Implementation Breakdown

## Detailed Task List

### Phase 1: Project Setup & Dependencies

#### 1.1 Install Dependencies
```bash
bun add grammy
bun add -d @types/node
```

**Tasks:**
- Install grammy package for Telegram bot framework
- Add TypeScript type definitions if needed
- Update package.json with dependencies

#### 1.2 Create Project Structure
```
src/
├── bot/
│   ├── index.ts
│   ├── handlers/
│   │   ├── commands.ts
│   │   ├── conversation.ts
│   │   ├── photos.ts
│   │   └── viewer.ts
│   ├── middleware/
│   │   ├── session.ts
│   │   └── error.ts
│   └── keyboards/
│       └── inline.ts
├── services/
│   ├── ai.ts
│   └── storage.ts
├── types/
│   ├── recipe.ts
│   ├── telegram.ts
│   ├── ai.ts
│   └── storage.ts
├── config/
│   └── index.ts
└── utils/
    ├── logger.ts
    └── validators.ts
```

#### 1.3 Environment Configuration
Create `.env.example`:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
ZAI_API_KEY=your_zai_api_key_here
ZAI_API_ENDPOINT=https://api.zai.com/v1
NODE_ENV=development
```

---

### Phase 2: Type Definitions

#### 2.1 Recipe Types (`src/types/recipe.ts`)
```typescript
export type RecipeCategory = 
  | 'main_course'
  | 'appetizer'
  | 'dessert'
  | 'beverage'
  | 'soup'
  | 'salad'
  | 'breakfast'
  | 'snack'
  | 'other';

export interface Ingredient {
  name: string;
  amount?: string;
  unit?: string;
  classification?: RecipeCategory;
}

export interface PhotoInfo {
  fileId: string;
  fileUniqueId: string;
  width: number;
  height: number;
}

export interface Recipe {
  id: string;
  userId: number;
  title: string;
  category: RecipeCategory;
  ingredients: Ingredient[];
  instructions?: string;
  photo?: PhotoInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartialRecipe {
  id?: string;
  userId?: number;
  title?: string;
  category?: RecipeCategory;
  ingredients?: Ingredient[];
  instructions?: string;
  photo?: PhotoInfo;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### 2.2 Telegram Types (`src/types/telegram.ts`)
```typescript
export interface UserSession {
  userId: number;
  state: 'idle' | 'adding_recipe' | 'selecting_category' | 'adding_title' | 'adding_photo';
  currentRecipe?: PartialRecipe;
  lastMessageId?: number;
  classifiedIngredients?: Ingredient[];
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export interface InlineKeyboard {
  inline_keyboard: InlineButton[][];
}
```

#### 2.3 AI Service Types (`src/types/ai.ts`)
```typescript
export interface AIConfig {
  apiKey: string;
  apiEndpoint?: string;
}

export interface ClassificationRequest {
  ingredients: string[];
}

export interface ClassificationResponse {
  ingredients: Ingredient[];
  suggestedCategory?: RecipeCategory;
}

export interface CategoryRequest {
  ingredients: Ingredient[];
  title?: string;
}

export interface FormatRequest {
  recipe: PartialRecipe;
}

export interface FormatResponse {
  formattedText: string;
  suggestedTitle?: string;
}
```

#### 2.4 Storage Types (`src/types/storage.ts`)
```typescript
export interface StorageConfig {
  maxRecipes?: number;
  maxSessions?: number;
}

export interface StorageService {
  // Recipe operations
  saveRecipe(recipe: Recipe): Promise<void>;
  getRecipe(id: string): Promise<Recipe | null>;
  getUserRecipes(userId: number): Promise<Recipe[]>;
  updateRecipe(id: string, updates: PartialRecipe): Promise<void>;
  deleteRecipe(id: string): Promise<void>;
  
  // Session operations
  getSession(userId: number): UserSession | null;
  setSession(userId: number, session: UserSession): void;
  clearSession(userId: number): void;
  getAllSessions(): UserSession[];
  
  // Utility operations
  clearAll(): void;
  getStats(): StorageStats;
}

export interface StorageStats {
  totalRecipes: number;
  totalUsers: number;
  activeSessions: number;
}
```

---

### Phase 3: Configuration Management

#### 3.1 Config Service (`src/config/index.ts`)
```typescript
export interface Config {
  telegramBotToken: string;
  zaiApiKey: string;
  zaiApiEndpoint: string;
  nodeEnv: 'development' | 'production';
}

export function loadConfig(): Config {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const zaiApiKey = process.env.ZAI_API_KEY;
  
  if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }
  
  if (!zaiApiKey) {
    throw new Error('ZAI_API_KEY is required');
  }
  
  return {
    telegramBotToken,
    zaiApiKey,
    zaiApiEndpoint: process.env.ZAI_API_ENDPOINT || 'https://api.zai.com/v1',
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  };
}
```

---

### Phase 4: Storage Service

#### 4.1 In-Memory Storage Implementation (`src/services/storage.ts`)
```typescript
import type { Recipe, UserSession, StorageService, StorageStats, PartialRecipe } from '../types';

export class InMemoryStorage implements StorageService {
  private recipes: Map<string, Recipe> = new Map();
  private userRecipes: Map<number, string[]> = new Map();
  private sessions: Map<number, UserSession> = new Map();
  
  // Recipe operations
  async saveRecipe(recipe: Recipe): Promise<void> {
    this.recipes.set(recipe.id, recipe);
    
    // Update user recipes index
    const userRecipes = this.userRecipes.get(recipe.userId) || [];
    if (!userRecipes.includes(recipe.id)) {
      userRecipes.push(recipe.id);
      this.userRecipes.set(recipe.userId, userRecipes);
    }
  }
  
  async getRecipe(id: string): Promise<Recipe | null> {
    return this.recipes.get(id) || null;
  }
  
  async getUserRecipes(userId: number): Promise<Recipe[]> {
    const recipeIds = this.userRecipes.get(userId) || [];
    const recipes: Recipe[] = [];
    
    for (const id of recipeIds) {
      const recipe = this.recipes.get(id);
      if (recipe) {
        recipes.push(recipe);
      }
    }
    
    return recipes;
  }
  
  async updateRecipe(id: string, updates: PartialRecipe): Promise<void> {
    const recipe = this.recipes.get(id);
    if (!recipe) {
      throw new Error(`Recipe not found: ${id}`);
    }
    
    const updated = {
      ...recipe,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.recipes.set(id, updated);
  }
  
  async deleteRecipe(id: string): Promise<void> {
    const recipe = this.recipes.get(id);
    if (!recipe) {
      throw new Error(`Recipe not found: ${id}`);
    }
    
    this.recipes.delete(id);
    
    // Remove from user index
    const userRecipes = this.userRecipes.get(recipe.userId) || [];
    const filtered = userRecipes.filter(rId => rId !== id);
    this.userRecipes.set(recipe.userId, filtered);
  }
  
  // Session operations
  getSession(userId: number): UserSession | null {
    return this.sessions.get(userId) || null;
  }
  
  setSession(userId: number, session: UserSession): void {
    this.sessions.set(userId, session);
  }
  
  clearSession(userId: number): void {
    this.sessions.delete(userId);
  }
  
  getAllSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }
  
  // Utility operations
  clearAll(): void {
    this.recipes.clear();
    this.userRecipes.clear();
    this.sessions.clear();
  }
  
  getStats(): StorageStats {
    return {
      totalRecipes: this.recipes.size,
      totalUsers: this.userRecipes.size,
      activeSessions: this.sessions.size,
    };
  }
}
```

---

### Phase 5: AI Service

#### 5.1 Zai AI Service (`src/services/ai.ts`)
```typescript
import type { AIConfig, ClassificationRequest, ClassificationResponse, CategoryRequest, FormatRequest, FormatResponse } from '../types';

export class ZaiAIService {
  private config: AIConfig;
  
  constructor(config: AIConfig) {
    this.config = config;
  }
  
  /**
   * Classify ingredients and assign categories
   */
  async classifyIngredients(request: ClassificationRequest): Promise<ClassificationResponse> {
    const prompt = this.buildClassificationPrompt(request.ingredients);
    
    try {
      const response = await this.callAI(prompt);
      return this.parseClassificationResponse(response);
    } catch (error) {
      console.error('AI classification error:', error);
      // Fallback: return ingredients without classification
      return {
        ingredients: request.ingredients.map(name => ({ name })),
      };
    }
  }
  
  /**
   * Determine recipe category from ingredients
   */
  async determineCategory(request: CategoryRequest): Promise<string> {
    const prompt = this.buildCategoryPrompt(request.ingredients, request.title);
    
    try {
      const response = await this.callAI(prompt);
      return this.parseCategoryResponse(response);
    } catch (error) {
      console.error('AI category determination error:', error);
      return 'other';
    }
  }
  
  /**
   * Format recipe for better readability
   */
  async formatRecipe(request: FormatRequest): Promise<FormatResponse> {
    const prompt = this.buildFormatPrompt(request.recipe);
    
    try {
      const response = await this.callAI(prompt);
      return this.parseFormatResponse(response);
    } catch (error) {
      console.error('AI formatting error:', error);
      // Fallback: simple formatting
      return {
        formattedText: this.simpleFormat(request.recipe),
      };
    }
  }
  
  /**
   * Suggest recipe title from ingredients
   */
  async suggestTitle(ingredients: string[]): Promise<string> {
    const prompt = `Suggest a creative recipe title based on these ingredients: ${ingredients.join(', ')}. Return only the title, no explanation.`;
    
    try {
      const response = await this.callAI(prompt);
      return response.trim();
    } catch (error) {
      console.error('AI title suggestion error:', error);
      return 'Untitled Recipe';
    }
  }
  
  // Private helper methods
  private async callAI(prompt: string): Promise<string> {
    const endpoint = this.config.apiEndpoint || 'https://api.zai.com/v1';
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'zai-1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful cooking assistant. Always respond with valid JSON when asked for structured data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  private buildClassificationPrompt(ingredients: string[]): string {
    return `Classify these ingredients and return JSON:
{
  "ingredients": [
    {
      "name": "ingredient name",
      "classification": "main_course|appetizer|dessert|beverage|soup|salad|breakfast|snack|other"
    }
  ],
  "suggestedCategory": "most likely recipe category"
}

Ingredients: ${ingredients.join(', ')}`;
  }
  
  private buildCategoryPrompt(ingredients: any[], title?: string): string {
    const ingredientNames = ingredients.map(i => i.name).join(', ');
    const titleText = title ? ` Recipe title: ${title}` : '';
    return `Determine the recipe category (main_course, appetizer, dessert, beverage, soup, salad, breakfast, snack, other) for these ingredients:${titleText}
${ingredientNames}

Return only the category name.`;
  }
  
  private buildFormatPrompt(recipe: any): string {
    return `Format this recipe for Telegram with proper Markdown. Make it visually appealing and easy to read.

Title: ${recipe.title}
Category: ${recipe.category}
Ingredients: ${recipe.ingredients.map((i: any) => i.name).join(', ')}
${recipe.instructions ? `Instructions: ${recipe.instructions}` : ''}

Return formatted text only.`;
  }
  
  private parseClassificationResponse(response: string): ClassificationResponse {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse AI response:', response);
      throw error;
    }
  }
  
  private parseCategoryResponse(response: string): string {
    const categories = ['main_course', 'appetizer', 'dessert', 'beverage', 'soup', 'salad', 'breakfast', 'snack', 'other'];
    const found = categories.find(cat => response.includes(cat));
    return found || 'other';
  }
  
  private parseFormatResponse(response: string): FormatResponse {
    return {
      formattedText: response.trim(),
    };
  }
  
  private simpleFormat(recipe: any): string {
    const lines = [
      `🍽️ *${recipe.title}*`,
      '',
      `📂 Category: ${recipe.category}`,
      '',
      '🥘 Ingredients:',
      ...recipe.ingredients.map((i: any) => `  • ${i.name}${i.amount ? ` (${i.amount}${i.unit || ''})` : ''}`),
    ];
    
    if (recipe.instructions) {
      lines.push('', '📝 Instructions:', recipe.instructions);
    }
    
    return lines.join('\n');
  }
}
```

---

### Phase 6: Bot Initialization

#### 6.1 Bot Setup (`src/bot/index.ts`)
```typescript
import { Bot, GrammyError } from 'grammy';
import { loadConfig } from '../config';
import { InMemoryStorage } from '../services/storage';
import { ZaiAIService } from '../services/ai';
import { setupCommands } from './handlers/commands';
import { setupConversation } from './handlers/conversation';
import { setupPhotos } from './handlers/photos';
import { setupViewer } from './handlers/viewer';
import { sessionMiddleware } from './middleware/session';
import { errorHandler } from './middleware/error';

export async function createBot() {
  const config = loadConfig();
  const storage = new InMemoryStorage();
  const aiService = new ZaiAIService({
    apiKey: config.zaiApiKey,
    apiEndpoint: config.zaiApiEndpoint,
  });
  
  const bot = new Bot(config.telegramBotToken);
  
  // Apply middleware
  bot.use(sessionMiddleware(storage));
  bot.use(errorHandler());
  
  // Setup handlers
  setupCommands(bot, storage, aiService);
  setupConversation(bot, storage, aiService);
  setupPhotos(bot, storage, aiService);
  setupViewer(bot, storage, aiService);
  
  // Error handling
  bot.catch((err) => {
    console.error('Bot error:', err);
  });
  
  return bot;
}
```

---

### Phase 7: Middleware

#### 7.1 Session Middleware (`src/bot/middleware/session.ts`)
```typescript
import { Middleware } from 'grammy';
import type { UserSession } from '../../types';
import type { StorageService } from '../../types';

export function sessionMiddleware(storage: StorageService): Middleware {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    
    if (!userId) {
      return next();
    }
    
    // Get or create session
    let session = storage.getSession(userId);
    
    if (!session) {
      session = {
        userId,
        state: 'idle',
      };
      storage.setSession(userId, session);
    }
    
    // Attach session to context
    (ctx as any).session = session;
    
    await next();
    
    // Save session after processing
    storage.setSession(userId, session);
  };
}
```

#### 7.2 Error Middleware (`src/bot/middleware/error.ts`)
```typescript
import { Middleware } from 'grammy';

export function errorHandler(): Middleware {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error('Error in middleware:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      try {
        await ctx.reply(`❌ Something went wrong: ${errorMessage}\n\nPlease try again or use /help`);
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  };
}
```

---

### Phase 8: Command Handlers

#### 8.1 Commands Implementation (`src/bot/handlers/commands.ts`)
```typescript
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
```

---

### Phase 9: Conversation Handler

#### 9.1 Conversation Flow (`src/bot/handlers/conversation.ts`)
```typescript
import { Bot } from 'grammy';
import type { StorageService } from '../../types';
import type { ZaiAIService } from '../../services/ai';
import { createCategoryKeyboard } from '../keyboards/inline';
import { v4 as uuidv4 } from 'uuid';

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
  classification.ingredients.forEach((ing, index) => {
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
```

---

### Phase 10: Inline Keyboards

#### 10.1 Keyboard Builder (`src/bot/keyboards/inline.ts`)
```typescript
import { InlineKeyboard } from 'grammy';
import type { InlineKeyboard as IK } from '../../types';

export function createCategoryKeyboard(): IK {
  const keyboard = new InlineKeyboard();
  
  // Row 1
  keyboard
    .text('🍽️ Main Course', 'category_main_course')
    .text('🥗 Appetizer', 'category_appetizer')
    .text('🍰 Dessert', 'category_dessert');
  
  // Row 2
  keyboard
    .row()
    .text('🥤 Beverage', 'category_beverage')
    .text('🍲 Soup', 'category_soup')
    .text('🥬 Salad', 'category_salad');
  
  // Row 3
  keyboard
    .row()
    .text('🍳 Breakfast', 'category_breakfast')
    .text('🍪 Snack', 'category_snack')
    .text('📦 Other', 'category_other');
  
  return keyboard;
}

export function createRecipeActionsKeyboard(recipeId: string): IK {
  const keyboard = new InlineKeyboard();
  
  keyboard
    .text('👁️ View', `view_${recipeId}`)
    .text('✏️ Edit', `edit_${recipeId}`)
    .text('🗑️ Delete', `delete_${recipeId}`);
  
  return keyboard;
}

export function createConfirmationKeyboard(): IK {
  const keyboard = new InlineKeyboard();
  
  keyboard
    .text('✅ Yes', 'confirm_yes')
    .text('❌ No', 'confirm_no');
  
  return keyboard;
}
```

---

### Phase 11: Photo Handler

#### 11.1 Photo Processing (`src/bot/handlers/photos.ts`)
```typescript
import { Bot } from 'grammy';
import type { StorageService } from '../../types';
import type { ZaiAIService } from '../../services/ai';
import { v4 as uuidv4 } from 'uuid';

export function setupPhotos(bot: Bot, storage: StorageService, aiService: ZaiAIService) {
  // Handle photo messages
  bot.on('message:photo', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    
    const session = (ctx as any).session;
    
    // Only accept photos when adding a recipe
    if (session.state !== 'adding_photo') {
      await ctx.reply('ℹ️ Please start by sending ingredients first.');
      return;
    }
    
    const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Get largest photo
    
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
  // Generate recipe ID
  const recipeId = uuidv4();
  
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
  
  await ctx.reply('✅ Recipe saved successfully!\n\n');
  
  // Send photo if exists
  if (recipe.photo) {
    await ctx.replyWithPhoto(recipe.photo.fileId, {
      caption: formatted.formattedText,
      parse_mode: 'Markdown',
    });
  } else {
    await ctx.reply(formatted.formattedText, { parse_mode: 'Markdown' });
  }
  
  await ctx.reply('\nSend me more ingredients to add another recipe!');
}
```

---

### Phase 12: Recipe Viewer

#### 12.1 Viewer Implementation (`src/bot/handlers/viewer.ts`)
```typescript
import { Bot } from 'grammy';
import type { StorageService } from '../../types';
import type { ZaiAIService } from '../../services/ai';
import { createRecipeActionsKeyboard } from '../keyboards/inline';

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
      await handleConfirmNo(ctx);
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
  
  const message = `📂 Category: ${category}\n\n`;
  
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
```

---

### Phase 13: Main Entry Point

#### 13.1 Application Entry (`index.ts`)
```typescript
import { createBot } from './src/bot';

async function main() {
  try {
    const bot = await createBot();
    
    console.log('🤖 Telegram Chef Bot is starting...');
    
    await bot.start();
    
    console.log('✅ Bot is running!');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();
```

---

### Phase 14: Utilities

#### 14.1 Logger (`src/utils/logger.ts`)
```typescript
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export function log(level: LogLevel, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

export const logger = {
  debug: (message: string, data?: any) => log(LogLevel.DEBUG, message, data),
  info: (message: string, data?: any) => log(LogLevel.INFO, message, data),
  warn: (message: string, data?: any) => log(LogLevel.WARN, message, data),
  error: (message: string, data?: any) => log(LogLevel.ERROR, message, data),
};
```

#### 14.2 Validators (`src/utils/validators.ts`)
```typescript
export function isValidIngredient(text: string): boolean {
  return text.trim().length > 0 && text.length <= 200;
}

export function isValidTitle(text: string): boolean {
  return text.trim().length > 0 && text.length <= 100;
}

export function isValidRecipeId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function sanitizeMarkdown(text: string): string {
  // Escape special Markdown characters
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}
```

---

### Phase 15: Documentation

#### 15.1 README.md
```markdown
# Telegram Chef Bot 🍳

A Telegram bot that organizes and formats your recipes using AI. Simply provide ingredients, and the bot will classify, categorize, and format your recipes beautifully.

## Features

- 🥘 **Ingredient Classification**: AI automatically classifies your ingredients
- 📂 **Smart Categorization**: Recipes are categorized (main course, dessert, etc.)
- 📸 **Photo Support**: Attach photos to your recipes
- 💬 **Conversational Interface**: Natural, easy-to-use conversation flow
- 🎨 **Beautiful Formatting**: Recipes are formatted for easy reading
- 🔍 **Recipe Management**: View, browse, and manage your recipes
- 🤖 **AI-Powered**: Uses Zai AI for intelligent recipe organization

## Technology Stack

- **Runtime**: Bun
- **Framework**: grammy (Telegram Bot API)
- **Language**: TypeScript (strict mode)
- **AI Service**: Zai API
- **Storage**: In-memory (extensible to database)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd telegram-chef
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
ZAI_API_KEY=your_zai_api_key_here
```

## Getting a Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions
3. Copy the bot token provided by BotFather
4. Paste it in your `.env` file

## Getting a Zai API Key

1. Visit [Zai](https://zai.com) and sign up
2. Navigate to your API settings
3. Generate an API key
4. Paste it in your `.env` file

## Usage

### Starting the Bot

```bash
bun run index.ts
```

### Using the Bot

1. **Start the bot**: Send `/start` to begin
2. **Add a recipe**: Simply type your ingredients
   ```
   2 cups flour
   1 cup sugar
   3 eggs
   1 tsp vanilla
   ```
3. **Select category**: Choose from inline keyboard buttons
4. **Add title**: Provide a title or accept AI suggestion
5. **Attach photo**: Optional - attach a photo of the dish
6. **View recipes**: Use `/myrecipes` to see all your recipes

### Commands

- `/start` - Start the bot and see welcome message
- `/help` - Show help and commands
- `/myrecipes` - View all your recipes
- `/recipe <id>` - View a specific recipe
- `/cancel` - Cancel current operation

## Project Structure

```
telegram-chef/
├── src/
│   ├── bot/              # Telegram bot implementation
│   │   ├── handlers/     # Message handlers
│   │   ├── middleware/   # Bot middleware
│   │   └── keyboards/    # Inline keyboards
│   ├── services/         # Core services
│   │   ├── ai.ts        # AI service
│   │   └── storage.ts   # Storage service
│   ├── types/           # TypeScript types
│   ├── config/          # Configuration
│   └── utils/           # Utilities
├── plans/               # Architecture and plans
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## Development

### Type Safety

The project uses TypeScript with strict mode enabled. All types are defined in `src/types/`.

### Adding New Features

1. Define types in `src/types/`
2. Implement service logic in `src/services/`
3. Add handlers in `src/bot/handlers/`
4. Update documentation

### Testing

To test the bot locally:

1. Start the bot: `bun run index.ts`
2. Open Telegram and search for your bot
3. Interact with the bot to test features

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Your Telegram bot token from @BotFather |
| `ZAI_API_KEY` | Yes | Your Zai API key |
| `ZAI_API_ENDPOINT` | No | Zai API endpoint (default: https://api.zai.com/v1) |
| `NODE_ENV` | No | Environment (development/production) |

## Recipe Categories

The bot supports the following categories:

- 🍽️ Main Course
- 🥗 Appetizer
- 🍰 Dessert
- 🥤 Beverage
- 🍲 Soup
- 🥬 Salad
- 🍳 Breakfast
- 🍪 Snack
- 📦 Other

## Future Enhancements

- Database integration (PostgreSQL/SQLite)
- Recipe search and filtering
- Recipe sharing and import/export
- Nutritional analysis
- Ingredient substitution suggestions
- Multiple photos per recipe
- Voice note support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Acknowledgments

- Built with [grammy](https://grammy.dev/)
- Powered by [Zai AI](https://zai.com)
- Runtime: [Bun](https://bun.sh)
```

---

## Testing Checklist

### Unit Tests
- [ ] AI service classification
- [ ] AI service category determination
- [ ] AI service formatting
- [ ] Storage CRUD operations
- [ ] Session management
- [ ] Validators

### Integration Tests
- [ ] Bot initialization
- [ ] Command handling
- [ ] Conversation flow
- [ ] Photo processing
- [ ] Callback query handling

### E2E Tests
- [ ] Complete recipe creation flow
- [ ] Recipe viewing
- [ ] Recipe deletion
- [ ] Error scenarios
- [ ] Cancel operation

### Manual Testing
- [ ] Add recipe with ingredients
- [ ] Select category via inline keyboard
- [ ] Add custom title
- [ ] Accept AI-suggested title
- [ ] Attach photo
- [ ] Skip photo
- [ ] View all recipes
- [ ] View specific recipe
- [ ] Cancel operation
- [ ] Multiple users (isolation)
- [ ] Error messages display correctly

---

## Deployment Considerations

### Environment Setup
- Set `NODE_ENV=production`
- Use secure environment variables
- Enable logging
- Set up monitoring

### Scaling
- Replace in-memory storage with database
- Add rate limiting
- Implement caching
- Load balancing

### Monitoring
- Track API usage
- Monitor error rates
- Log user interactions
- Performance metrics

---

This implementation plan provides a comprehensive roadmap for building the Telegram Chef Bot with all requested features.
