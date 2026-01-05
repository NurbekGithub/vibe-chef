import type { Recipe, SearchOptions } from '../types/recipe.js';

export class RecipeStorage {
  private recipes: Map<string, Recipe>;

  constructor() {
    this.recipes = new Map();
  }

  /**
   * Add a recipe to storage
   */
  add(recipe: Recipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  /**
   * Get a recipe by ID
   */
  getById(id: string): Recipe | undefined {
    return this.recipes.get(id);
  }

  /**
   * Get all recipes
   */
  getAll(): Recipe[] {
    return Array.from(this.recipes.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Search recipes by query
   * Searches in recipe name and optionally in ingredients
   */
  search(options: SearchOptions): Recipe[] {
    const { query, searchInIngredients = true } = options;
    const lowerQuery = query.toLowerCase();

    return Array.from(this.recipes.values())
      .filter(recipe => {
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
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Delete a recipe by ID
   */
  delete(id: string): boolean {
    return this.recipes.delete(id);
  }

  /**
   * Clear all recipes
   */
  clear(): void {
    this.recipes.clear();
  }

  /**
   * Get the count of stored recipes
   */
  count(): number {
    return this.recipes.size;
  }

  /**
   * Check if a recipe exists
   */
  exists(id: string): boolean {
    return this.recipes.has(id);
  }

  /**
   * Get recipes by language
   */
  getByLanguage(language: 'en' | 'ru'): Recipe[] {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.originalLanguage === language)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get recipes created after a certain date
   */
  getAfterDate(date: Date): Recipe[] {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.createdAt > date)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get recipes created before a certain date
   */
  getBeforeDate(date: Date): Recipe[] {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.createdAt < date)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
