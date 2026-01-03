import { InlineKeyboard } from 'grammy';

export function createCategoryKeyboard() {
  const keyboard = new InlineKeyboard();
  
  // Row 1
  keyboard
    .text('🍽️ Основное блюдо', 'category_main_course')
    .text('🥗 Закуска', 'category_appetizer')
    .text('🍰 Десерт', 'category_dessert');
  
  // Row 2
  keyboard
    .row()
    .text('🥤 Напиток', 'category_beverage')
    .text('🍲 Суп', 'category_soup')
    .text('🥬 Салат', 'category_salad');
  
  // Row 3
  keyboard
    .row()
    .text('🍳 Завтрак', 'category_breakfast')
    .text('🍪 Закуска', 'category_snack')
    .text('📦 Другое', 'category_other');
  
  return keyboard;
}

export function createRecipeActionsKeyboard(recipeId: string) {
  const keyboard = new InlineKeyboard();
  
  keyboard
    .text('👁️ Просмотр', `view_${recipeId}`)
    .text('✏️ Редактировать', `edit_${recipeId}`)
    .text('🗑️ Удалить', `delete_${recipeId}`);
  
  return keyboard;
}

export function createConfirmationKeyboard() {
  const keyboard = new InlineKeyboard();
  
  keyboard
    .text('✅ Да', 'confirm_yes')
    .text('❌ Нет', 'confirm_no');
  
  return keyboard;
}
