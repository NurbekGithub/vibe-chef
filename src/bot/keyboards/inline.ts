import { InlineKeyboard } from 'grammy';

export function createCategoryKeyboard() {
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

export function createRecipeActionsKeyboard(recipeId: string) {
  const keyboard = new InlineKeyboard();
  
  keyboard
    .text('👁️ View', `view_${recipeId}`)
    .text('✏️ Edit', `edit_${recipeId}`)
    .text('🗑️ Delete', `delete_${recipeId}`);
  
  return keyboard;
}

export function createConfirmationKeyboard() {
  const keyboard = new InlineKeyboard();
  
  keyboard
    .text('✅ Yes', 'confirm_yes')
    .text('❌ No', 'confirm_no');
  
  return keyboard;
}
