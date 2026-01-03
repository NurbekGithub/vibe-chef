import type { Ingredient, RecipeCategory, PartialRecipe } from './recipe';

export interface AIConfig {
  apiKey: string;
  apiEndpoint?: string;
}

export interface ClassificationRequest {
  ingredients: string[];
}

export interface ClassificationResponse {
  ingredients: Array<{
    name: string;
    classification?: RecipeCategory;
  }>;
  suggestedCategory?: RecipeCategory;
}

export interface CategoryRequest {
  ingredients: Array<{
    name: string;
    classification?: RecipeCategory;
  }>;
  title?: string;
}

export interface FormatRequest {
  recipe: PartialRecipe;
}

export interface FormatResponse {
  formattedText: string;
  suggestedTitle?: string;
}
