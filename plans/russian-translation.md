# Russian Translation Plan for Telegram Chef

## Overview
Translate all user-facing messages from English to Russian for Russian-speaking users. The AI service should also be configured to expect Russian input and respond in Russian.

## Files to Modify

### 1. Command Handler Messages (`src/bot/handlers/commands.ts`)

#### /start Command
**Original:**
```
👋 Welcome to *Telegram Chef*!

I'm your personal recipe organizer. Here's what I can do:

• Send me ingredients and I'll help organize them
• Attach photos to your recipes
• I'll classify and categorize your recipes automatically
• View all your recipes anytime

*Getting Started:*
Just start typing your ingredients or use /help for more information!
```

**Russian Translation:**
```
👋 Добро пожаловать в *Telegram Chef*!

Я ваш личный организатор рецептов. Вот что я умею:

• Отправьте мне ингредиенты, и я помогу их организовать
• Прикрепляйте фото к вашим рецептам
• Я автоматически классифицирую и категоризирую ваши рецепты
• Просматривайте все ваши рецепты в любое время

*Как начать:*
Просто начните вводить ингредиенты или используйте /help для получения дополнительной информации!
```

#### /help Command
**Original:**
```
📚 *Help & Commands*

*Commands:*
/start - Start the bot and see welcome message
/help - Show this help message
/myrecipes - View all your recipes
/recipe <id> - View a specific recipe
/cancel - Cancel current operation

*How to add a recipe:*
1. Send me your ingredients as text
2. I'll classify them and suggest a category
3. Select a category from the inline buttons
4. Provide a title (or accept my suggestion)
5. Attach a photo (optional)
6. Your recipe is saved!

*Tips:*
• You can send ingredients in any format
• Photos are optional but recommended
• Use /cancel to start over anytime
```

**Russian Translation:**
```
📚 *Помощь и команды*

*Команды:*
/start - Запустить бота и увидеть приветственное сообщение
/help - Показать это справочное сообщение
/myrecipes - Просмотреть все ваши рецепты
/recipe <id> - Просмотреть конкретный рецепт
/cancel - Отменить текущую операцию

*Как добавить рецепт:*
1. Отправьте мне ингредиенты в виде текста
2. Я классифицирую их и предложу категорию
3. Выберите категорию из встроенных кнопок
4. Укажите название (или примите мое предложение)
5. Прикрепите фото (необязательно)
6. Ваш рецепт сохранен!

*Советы:*
• Вы можете отправлять ингредиенты в любом формате
• Фото необязательно, но рекомендуется
• Используйте /cancel, чтобы начать заново в любое время
```

#### /myrecipes Command
**Original:**
```
📭 You don't have any recipes yet.

Start by sending me some ingredients!
```

**Russian Translation:**
```
📭 У вас пока нет рецептов.

Начните с отправки мне ингредиентов!
```

**Original:**
```
📖 *Your Recipes (count)*

1. Recipe Title
   📂 category
   🆔 id

Use /recipe <id> to view a specific recipe
```

**Russian Translation:**
```
📖 *Ваши рецепты (count)*

1. Название рецепта
   📂 категория
   🆔 id

Используйте /recipe <id> для просмотра конкретного рецепта
```

#### /recipe Command
**Original:**
```
Please provide a recipe ID: /recipe <id>
```

**Russian Translation:**
```
Пожалуйста, укажите ID рецепта: /recipe <id>
```

**Original:**
```
❌ Recipe not found. Use /myrecipes to see your recipes.
```

**Russian Translation:**
```
❌ Рецепт не найден. Используйте /myrecipes для просмотра ваших рецептов.
```

**Original:**
```
❌ You can only view your own recipes.
```

**Russian Translation:**
```
❌ Вы можете просматривать только свои рецепты.
```

#### /cancel Command
**Original:**
```
ℹ️ No active operation to cancel.
```

**Russian Translation:**
```
ℹ️ Нет активной операции для отмены.
```

**Original:**
```
✅ Operation cancelled. Send me some ingredients to start a new recipe!
```

**Russian Translation:**
```
✅ Операция отменена. Отправьте мне ингредиенты, чтобы начать новый рецепт!
```

### 2. Conversation Handler Messages (`src/bot/handlers/conversation.ts`)

**Original:**
```
Please complete the current operation or use /cancel to start over.
```

**Russian Translation:**
```
Пожалуйста, завершите текущую операцию или используйте /cancel, чтобы начать заново.
```

**Original:**
```
Please provide at least one ingredient.
```

**Russian Translation:**
```
Пожалуйста, укажите хотя бы один ингредиент.
```

**Original:**
```
🔄 Analyzing ingredients...
```

**Russian Translation:**
```
🔄 Анализ ингредиентов...
```

**Original:**
```
🥘 *Ingredients classified:*

1. Ingredient Name (classification)

Please select a category for this recipe:
```

**Russian Translation:**
```
🥘 *Ингредиенты классифицированы:*

1. Название ингредиента (классификация)

Пожалуйста, выберите категорию для этого рецепта:
```

**Original:**
```
Please provide a title or use /cancel to cancel.
```

**Russian Translation:**
```
Пожалуйста, укажите название или используйте /cancel для отмены.
```

**Original:**
```
📸 Great! Title set to: "title"

You can now attach a photo (optional) or send /skip to finish.
```

**Russian Translation:**
```
📸 Отлично! Название установлено: "title"

Теперь вы можете прикрепить фото (необязательно) или отправить /skip для завершения.
```

### 3. Photo Handler Messages (`src/bot/handlers/photos.ts`)

**Original:**
```
ℹ️ Please start by sending ingredients first.
```

**Russian Translation:**
```
ℹ️ Пожалуйста, начните с отправки ингредиентов.
```

**Original:**
```
❌ Failed to process photo. Please try again.
```

**Russian Translation:**
```
❌ Не удалось обработать фото. Пожалуйста, попробуйте снова.
```

**Original:**
```
✅ Recipe saved successfully!


```

**Russian Translation:**
```
✅ Рецепт успешно сохранен!


```

**Original:**
```
Send me more ingredients to add another recipe!
```

**Russian Translation:**
```
Отправьте мне больше ингредиентов, чтобы добавить еще один рецепт!
```

### 4. Viewer Handler Messages (`src/bot/handlers/viewer.ts`)

**Original:**
```
Recipe not found
```

**Russian Translation:**
```
Рецепт не найден
```

**Original:**
```
Access denied
```

**Russian Translation:**
```
Доступ запрещен
```

**Original:**
```
⚠️ Are you sure you want to delete "recipe title"?
```

**Russian Translation:**
```
⚠️ Вы уверены, что хотите удалить "название рецепта"?
```

**Original:**
```
No pending deletion
```

**Russian Translation:**
```
Нет ожидающего удаления
```

**Original:**
```
Recipe deleted
```

**Russian Translation:**
```
Рецепт удален
```

**Original:**
```
✅ Recipe deleted successfully.
```

**Russian Translation:**
```
✅ Рецепт успешно удален.
```

**Original:**
```
Failed to delete recipe
```

**Russian Translation:**
```
Не удалось удалить рецепт
```

**Original:**
```
Deletion cancelled
```

**Russian Translation:**
```
Удаление отменено
```

**Original:**
```
✅ Deletion cancelled.
```

**Russian Translation:**
```
✅ Удаление отменено.
```

### 5. Inline Keyboard Labels (`src/bot/keyboards/inline.ts`)

#### Category Keyboard
**Original:**
```
🍽️ Main Course
🥗 Appetizer
🍰 Dessert
🥤 Beverage
🍲 Soup
🥬 Salad
🍳 Breakfast
🍪 Snack
📦 Other
```

**Russian Translation:**
```
🍽️ Основное блюдо
🥗 Закуска
🍰 Десерт
🥤 Напиток
🍲 Суп
🥬 Салат
🍳 Завтрак
🍪 Закуска
📦 Другое
```

#### Recipe Actions Keyboard
**Original:**
```
👁️ View
✏️ Edit
🗑️ Delete
```

**Russian Translation:**
```
👁️ Просмотр
✏️ Редактировать
🗑️ Удалить
```

#### Confirmation Keyboard
**Original:**
```
✅ Yes
❌ No
```

**Russian Translation:**
```
✅ Да
❌ Нет
```

### 6. Error Handler Messages (`src/bot/middleware/error.ts`)

**Original:**
```
❌ Something went wrong: error message

Please try again or use /help
```

**Russian Translation:**
```
❌ Что-то пошло не так: сообщение об ошибке

Пожалуйста, попробуйте снова или используйте /help
```

### 7. AI Service Updates (`src/services/ai.ts`)

#### Update API Call Headers
**Change:**
```typescript
'Accept-Language': 'en-US,en',
```

**To:**
```typescript
'Accept-Language': 'ru-RU,ru',
```

#### Update System Prompt
**Original:**
```
You are a helpful cooking assistant. Always respond with valid JSON when asked for structured data.
```

**Russian Translation:**
```
Вы полезный кулинарный помощник. Всегда отвечайте валидным JSON, когда запрашивают структурированные данные.
```

#### Update Title Suggestion Prompt
**Original:**
```
Suggest a creative recipe title based on these ingredients: ingredients. Return only the title, no explanation.
```

**Russian Translation:**
```
Предложите креативное название рецепта на основе этих ингредиентов: ингредиенты. Верните только название, без объяснений.
```

**Original:**
```
Untitled Recipe
```

**Russian Translation:**
```
Рецепт без названия
```

#### Update Classification Prompt
**Original:**
```
Classify these ingredients and return JSON:
{
  "ingredients": [
    {
      "name": "ingredient name",
      "classification": "main_course|appetizer|dessert|beverage|soup|salad|breakfast|snack|other"
    }
  ],
  "suggestedCategory": "most likely recipe category"
}

Ingredients: ingredients
```

**Russian Translation:**
```
Классифицируйте эти ингредиенты и верните JSON:
{
  "ingredients": [
    {
      "name": "название ингредиента",
      "classification": "main_course|appetizer|dessert|beverage|soup|salad|breakfast|snack|other"
    }
  ],
  "suggestedCategory": "наиболее вероятная категория рецепта"
}

Ингредиенты: ингредиенты
```

#### Update Category Prompt
**Original:**
```
Determine the recipe category (main_course, appetizer, dessert, beverage, soup, salad, breakfast, snack, other) for these ingredients: title
ingredients

Return only the category name.
```

**Russian Translation:**
```
Определите категорию рецепта (main_course, appetizer, dessert, beverage, soup, salad, breakfast, snack, other) для этих ингредиентов: title
ингредиенты

Верните только название категории.
```

#### Update Format Prompt
**Original:**
```
Format this recipe for Telegram with proper Markdown. Make it visually appealing and easy to read.

Title: title
Category: category
Ingredients: ingredients
Instructions: instructions

Return formatted text only.
```

**Russian Translation:**
```
Отформатируйте этот рецепт для Telegram с правильным Markdown. Сделайте его визуально привлекательным и легким для чтения.

Название: title
Категория: category
Ингредиенты: ingredients
Инструкции: instructions

Верните только отформатированный текст.
```

#### Update Simple Format Fallback
**Original:**
```
🍽️ *Title*
📂 Category: category
🥘 Ingredients:
  • ingredient name (amount unit)
📝 Instructions: instructions
```

**Russian Translation:**
```
🍽️ *Название*
📂 Категория: category
🥘 Ингредиенты:
  • название ингредиента (количество единица)
📝 Инструкции: instructions
```

## Implementation Order

1. Translate command handler messages
2. Translate conversation handler messages
3. Translate photo handler messages
4. Translate viewer handler messages
5. Translate inline keyboard labels
6. Translate error handler messages
7. Update AI service prompts and fallback messages
8. Test all translated messages

## Notes

- Maintain all emoji icons
- Keep Markdown formatting intact
- Ensure consistent terminology across all messages
- Category values in the backend should remain in English (main_course, appetizer, etc.) for consistency, but display labels should be in Russian
- The AI service should be configured to accept Russian input and respond in Russian
