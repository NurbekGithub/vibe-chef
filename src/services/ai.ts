import type {
  AIConfig,
  ClassificationRequest,
  ClassificationResponse,
  CategoryRequest,
  FormatRequest,
  FormatResponse,
  RecipeCategory,
  PartialRecipe,
} from '../types';

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
  async determineCategory(request: CategoryRequest): Promise<RecipeCategory> {
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
    const prompt = `Предложите креативное название рецепта на основе этих ингредиентов: ${ingredients.join(', ')}. Верните только название, без объяснений.`;
    
    try {
      const response = await this.callAI(prompt);
      return response.trim();
    } catch (error) {
      console.error('AI title suggestion error:', error);
      return 'Рецепт без названия';
    }
  }
  
  // Private helper methods
  private async callAI(prompt: string): Promise<string> {
    const endpoint = this.config.apiEndpoint || 'https://api.z.ai/api/paas/v4';
    
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Accept-Language': 'ru-RU,ru',
      },
      body: JSON.stringify({
        model: 'glm-4.7',
        messages: [
          {
            role: 'system',
            content: 'Вы полезный кулинарный помощник. Всегда отвечайте валидным JSON, когда запрашивают структурированные данные.',
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
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    };
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid AI response format');
    }
    
    return data.choices[0].message.content;
  }
  
  private buildClassificationPrompt(ingredients: string[]): string {
    return `Классифицируйте эти ингредиенты и верните JSON:
{
  "ingredients": [
    {
      "name": "название ингредиента",
      "classification": "main_course|appetizer|dessert|beverage|soup|salad|breakfast|snack|other"
    }
  ],
  "suggestedCategory": "наиболее вероятная категория рецепта"
}

Ингредиенты: ${ingredients.join(', ')}`;
  }
  
  private buildCategoryPrompt(ingredients: Array<{ name: string; classification?: RecipeCategory }>, title?: string): string {
    const ingredientNames = ingredients.map(i => i.name).join(', ');
    const titleText = title ? ` Название рецепта: ${title}` : '';
    return `Определите категорию рецепта (main_course, appetizer, dessert, beverage, soup, salad, breakfast, snack, other) для этих ингредиентов:${titleText}
 ${ingredientNames}

Верните только название категории.`;
  }
  
  private buildFormatPrompt(recipe: PartialRecipe): string {
    const ingredientText = recipe.ingredients?.map(i => i.name).join(', ') || '';
    return `Отформатируйте этот рецепт для Telegram с правильным Markdown. Сделайте его визуально привлекательным и легким для чтения.

Название: ${recipe.title || 'Рецепт без названия'}
Категория: ${recipe.category || 'other'}
Ингредиенты: ${ingredientText}
${recipe.instructions ? `Инструкции: ${recipe.instructions}` : ''}

Верните только отформатированный текст.`;
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
  
  private parseCategoryResponse(response: string): RecipeCategory {
    const categories: RecipeCategory[] = ['main_course', 'appetizer', 'dessert', 'beverage', 'soup', 'salad', 'breakfast', 'snack', 'other'];
    const found = categories.find(cat => response.includes(cat));
    return found || 'other';
  }
  
  private parseFormatResponse(response: string): FormatResponse {
    return {
      formattedText: response.trim(),
    };
  }
  
  private simpleFormat(recipe: PartialRecipe): string {
    const lines = [
      `🍽️ *${recipe.title || 'Рецепт без названия'}*`,
      '',
      `📂 Категория: ${recipe.category || 'other'}`,
      '',
      '🥘 Ингредиенты:',
      ...(recipe.ingredients?.map(i => `  • ${i.name}${i.amount ? ` (${i.amount}${i.unit || ''})` : ''}`) || []),
    ];
    
    if (recipe.instructions) {
      lines.push('', '📝 Инструкции:', recipe.instructions);
    }
    
    return lines.join('\n');
  }
}
