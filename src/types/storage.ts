import type { Recipe, PartialRecipe } from './recipe';
import type { UserSession } from './telegram';

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
