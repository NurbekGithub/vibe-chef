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
