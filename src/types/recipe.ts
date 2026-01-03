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
