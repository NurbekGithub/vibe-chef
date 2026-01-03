import type { PartialRecipe, RecipeCategory } from './recipe';

export interface UserSession {
  userId: number;
  state: 'idle' | 'adding_recipe' | 'selecting_category' | 'adding_title' | 'adding_photo';
  currentRecipe?: PartialRecipe;
  lastMessageId?: number;
  classifiedIngredients?: Array<{
    name: string;
    classification?: RecipeCategory;
  }>;
  pendingDelete?: string;
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export interface InlineKeyboard {
  inline_keyboard: InlineButton[][];
}
