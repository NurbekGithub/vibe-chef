import { RedisClient } from 'bun';
import type { Recipe, SearchOptions } from '../types/recipe.js';

export class RecipeStorage {
  private redis: RedisClient;
  private readonly RECIPE_PREFIX = 'recipe:';
  private readonly RECIPE_INDEX_KEY = 'recipe:index';

  constructor(redisUrl: string) {
    this.redis = new RedisClient(redisUrl, {
      autoReconnect: true,
      maxRetries: 10,
    });
  }

  /**
   * Add a recipe to storage
   */
  async add(recipe: Recipe): Promise<void> {
    const key = `${this.RECIPE_PREFIX}${recipe.id}`;
    const serialized = this.serializeRecipe(recipe);
    
    // Store the recipe
    await this.redis.set(key, serialized);
    
    // Add to index
    await this.redis.sadd(this.RECIPE_INDEX_KEY, recipe.id);
  }

  /**
   * Get a recipe by ID
   */
  async getById(id: string): Promise<Recipe | undefined> {
    const key = `${this.RECIPE_PREFIX}${id}`;
    const serialized = await this.redis.get(key);
    
    if (!serialized) {
      return undefined;
    }
    
    return this.deserializeRecipe(serialized);
  }

  /**
   * Get all recipes
   */
  async getAll(): Promise<Recipe[]> {
    // Get all recipe IDs from index
    const ids = await this.redis.smembers(this.RECIPE_INDEX_KEY);
    
    if (ids.length === 0) {
      return [];
    }
    
    // Fetch all recipes
    const keys = ids.map(id => `${this.RECIPE_PREFIX}${id}`);
    const serializedRecipes = await this.redis.mget(...keys);
    
    // Deserialize and sort by createdAt
    const recipes: Recipe[] = [];
    for (const serialized of serializedRecipes) {
      if (serialized) {
        recipes.push(this.deserializeRecipe(serialized));
      }
    }
    
    return recipes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Search recipes by query
   * Searches in recipe name and optionally in ingredients
   */
  async search(options: SearchOptions): Promise<Recipe[]> {
    const { query, searchInIngredients = true } = options;
    const lowerQuery = query.toLowerCase();
    
    // Get all recipes
    const recipes = await this.getAll();
    
    // Filter recipes
    return recipes.filter(recipe => {
      // Search in recipe name
      const nameMatch = recipe.name.toLowerCase().includes(lowerQuery);
      
      // Search in ingredients if enabled
      let ingredientMatch = false;
      if (searchInIngredients) {
        ingredientMatch = recipe.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(lowerQuery)
        );
      }
      
      return nameMatch || ingredientMatch;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Delete a recipe by ID
   */
  async delete(id: string): Promise<boolean> {
    const key = `${this.RECIPE_PREFIX}${id}`;
    
    // Check if recipe exists
    const exists = await this.redis.exists(key);
    if (!exists) {
      return false;
    }
    
    // Delete the recipe
    await this.redis.del(key);
    
    // Remove from index
    await this.redis.srem(this.RECIPE_INDEX_KEY, id);
    
    return true;
  }

  /**
   * Clear all recipes
   */
  async clear(): Promise<void> {
    // Get all recipe IDs
    const ids = await this.redis.smembers(this.RECIPE_INDEX_KEY);
    
    if (ids.length === 0) {
      return;
    }
    
    // Delete all recipe keys
    const keys = ids.map(id => `${this.RECIPE_PREFIX}${id}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    // Clear the index
    await this.redis.del(this.RECIPE_INDEX_KEY);
  }

  /**
   * Get the count of stored recipes
   */
  async count(): Promise<number> {
    return await this.redis.scard(this.RECIPE_INDEX_KEY);
  }

  /**
   * Check if a recipe exists
   */
  async exists(id: string): Promise<boolean> {
    const key = `${this.RECIPE_PREFIX}${id}`;
    return await this.redis.exists(key);
  }

  /**
   * Get recipes by language
   */
  async getByLanguage(language: 'en' | 'ru'): Promise<Recipe[]> {
    const recipes = await this.getAll();
    
    return recipes
      .filter(recipe => recipe.originalLanguage === language)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get recipes created after a certain date
   */
  async getAfterDate(date: Date): Promise<Recipe[]> {
    const recipes = await this.getAll();
    
    return recipes
      .filter(recipe => recipe.createdAt > date)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get recipes created before a certain date
   */
  async getBeforeDate(date: Date): Promise<Recipe[]> {
    const recipes = await this.getAll();
    
    return recipes
      .filter(recipe => recipe.createdAt < date)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Serialize recipe to JSON string
   * Handles Date object serialization
   */
  private serializeRecipe(recipe: Recipe): string {
    return JSON.stringify({
      ...recipe,
      createdAt: recipe.createdAt.toISOString(),
    });
  }

  /**
   * Deserialize recipe from JSON string
   * Handles Date object deserialization
   */
  private deserializeRecipe(serialized: string): Recipe {
    const parsed = JSON.parse(serialized);
    
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
    };
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    this.redis.close();
  }
}
