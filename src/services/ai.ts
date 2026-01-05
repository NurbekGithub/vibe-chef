import type { ExtractedRecipe, Recipe } from '../types/recipe.js';

export class AIServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class AIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.z.ai/api/coding/paas/v4', model: string = 'glm-4.7') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  /**
   * Make a chat completion request to Z.AI
   */
  private async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    forceJson: boolean = false
  ): Promise<string> {
    const endpoint = `${this.baseUrl}/chat/completions`;

    try {
      console.log(`🤖 Calling Z.AI API: ${endpoint}`);
      console.log(`📝 Model: ${this.model}, Messages: ${messages.length}, Force JSON: ${forceJson}`);
      
      const requestBody: any = {
        model: this.model,
        messages,
        temperature: 0.7,
      };

      // Force JSON output if requested
      if (forceJson) {
        requestBody.response_format = { type: "json_object" };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept-Language': 'en-US,en',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Z.AI API error (${response.status}): ${errorText}`);
        
        // Provide user-friendly error messages
        let userMessage = `Z.AI API error: ${response.statusText}`;
        if (response.status === 429 || errorText.includes('Insufficient balance')) {
          userMessage = '❌ Z.AI account has insufficient balance. Please add credits at https://z.ai/manage-apikey/apikey-list';
        } else if (response.status === 401) {
          userMessage = '❌ Invalid Z.AI API key. Please check your .env file.';
        }
        
        throw new AIServiceError(userMessage, response.status);
      }

      const data = await response.json() as {
        id: string;
        object: string;
        created: number;
        model: string;
        choices: Array<{
          index: number;
          message: {
            role: string;
            content: string;
            reasoning_content?: string;
          };
          finish_reason: string;
        }>;
        usage: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        };
      };

      const content = data.choices[0]?.message?.content || '';
      console.log(`✅ Z.AI response received (${content.length} chars)`);
      console.log(`📊 Token usage: ${data.usage?.total_tokens || 'N/A'} total`);
      return content;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      console.error(`❌ Failed to call Z.AI API: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new AIServiceError(
        `Failed to call Z.AI API: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract recipe information from transcript
   */
  async extractRecipe(transcript: string): Promise<ExtractedRecipe> {
    const systemPrompt = `You are a professional cooking assistant. Analyze the following YouTube video transcript and extract recipe information in JSON format.

You must respond with valid JSON only. Do not include any markdown formatting, code blocks, or additional text.

JSON format:
{
  "name": "Recipe name",
  "cookingTime": "Time to cook (e.g., '30 minutes', '1 hour')",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "detectedLanguage": "en" or "ru"
}

Rules:
- Extract only recipe-related information
- Be precise with measurements
- Format cooking time clearly
- If there is pork in ingedients, change it to just "meat", pork NOT ALLOWED
- Detect if the recipe is in English or Russian
- Return valid JSON only, no additional text
- If cooking time is not mentioned, estimate based on the recipe complexity`;

    const userPrompt = `Extract the recipe from this transcript:\n\n${transcript}`;

    try {
      // Force JSON output from the API
      const response = await this.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], true); // Force JSON mode

      // Try to parse the response as JSON directly first
      let recipe: ExtractedRecipe;
      try {
        recipe = JSON.parse(response);
      } catch (directParseError) {
        // If direct parse fails, try to extract JSON from markdown code blocks
        console.warn('⚠️ Direct JSON parse failed, attempting to extract from markdown');
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                         response.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          console.error('❌ Response content:', response.substring(0, 500));
          throw new AIServiceError('Failed to extract JSON from AI response. Response was not valid JSON.');
        }

        recipe = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }

      // Validate the response
      if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
        console.error('❌ Invalid recipe structure:', recipe);
        throw new AIServiceError('Invalid recipe structure from AI response. Missing required fields.');
      }

      // Ensure detectedLanguage is valid
      if (recipe.detectedLanguage !== 'en' && recipe.detectedLanguage !== 'ru') {
        recipe.detectedLanguage = 'en'; // Default to English
      }

      return recipe;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new AIServiceError('Failed to parse AI response as JSON');
      }
      throw new AIServiceError(
        `Failed to extract recipe: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Translate recipe from English to Russian
   */
  async translateToRussian(recipe: ExtractedRecipe): Promise<ExtractedRecipe> {
    const systemPrompt = `You are a professional translator. Translate the following recipe from English to Russian. Return the result in the same JSON format.

You must respond with valid JSON only. Do not include any markdown formatting, code blocks, or additional text.

JSON format:
{
  "name": "Translated name",
  "cookingTime": "Translated time",
  "ingredients": ["Translated ingredient 1", ...],
  "instructions": ["Translated step 1", ...],
  "detectedLanguage": "ru"
}

Rules:
- Maintain the same JSON structure
- Translate all text fields
- Keep measurements and numbers unchanged
- Use natural Russian cooking terminology
- Return valid JSON only`;

    const userPrompt = `Translate this recipe to Russian:\n\n${JSON.stringify(recipe, null, 2)}`;

    try {
      // Force JSON output from the API
      const response = await this.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], true); // Force JSON mode

      // Try to parse the response as JSON directly first
      let translatedRecipe: ExtractedRecipe;
      try {
        translatedRecipe = JSON.parse(response);
      } catch (directParseError) {
        // If direct parse fails, try to extract JSON from markdown code blocks
        console.warn('⚠️ Direct JSON parse failed, attempting to extract from markdown');
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                         response.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          console.error('❌ Response content:', response.substring(0, 500));
          throw new AIServiceError('Failed to extract JSON from translation response. Response was not valid JSON.');
        }

        translatedRecipe = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }

      // Validate the response
      if (!translatedRecipe.name || !translatedRecipe.ingredients || !translatedRecipe.instructions) {
        console.error('❌ Invalid translated recipe structure:', translatedRecipe);
        throw new AIServiceError('Invalid translated recipe structure. Missing required fields.');
      }

      translatedRecipe.detectedLanguage = 'ru';

      return translatedRecipe;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new AIServiceError('Failed to parse translation response as JSON');
      }
      throw new AIServiceError(
        `Failed to translate recipe: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Complete pipeline: extract recipe and translate if needed
   */
  async processRecipe(transcript: string, youtubeUrl: string): Promise<Recipe> {
    // Extract recipe from transcript
    const extractedRecipe = await this.extractRecipe(transcript);

    // Translate to Russian if the recipe is in English
    let finalRecipe = extractedRecipe;
    if (extractedRecipe.detectedLanguage === 'en') {
      finalRecipe = await this.translateToRussian(extractedRecipe);
    }

    // Create complete recipe object
    const recipe: Recipe = {
      id: this.generateRecipeId(),
      name: finalRecipe.name,
      cookingTime: finalRecipe.cookingTime,
      ingredients: finalRecipe.ingredients,
      instructions: finalRecipe.instructions,
      originalLanguage: extractedRecipe.detectedLanguage,
      youtubeUrl,
      transcript,
      createdAt: new Date(),
    };

    return recipe;
  }

  /**
   * Generate unique recipe ID
   */
  private generateRecipeId(): string {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chatCompletion([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Connection successful"' },
      ]);
      return response.includes('Connection successful');
    } catch {
      return false;
    }
  }
}
