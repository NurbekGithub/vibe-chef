# Telegram Chef Bot 🍳

A Telegram bot that organizes and formats your recipes using AI. Simply provide ingredients, and the bot will classify, categorize, and format your recipes beautifully.

## Features

- 🥘 **Ingredient Classification**: AI automatically classifies your ingredients
- 📂 **Smart Categorization**: Recipes are categorized (main course, dessert, etc.)
- 📸 **Photo Support**: Attach photos to your recipes
- 💬 **Conversational Interface**: Natural, easy-to-use conversation flow
- 🎨 **Beautiful Formatting**: Recipes are formatted for easy reading
- 🔍 **Recipe Management**: View, browse, and manage your recipes
- 🤖 **AI-Powered**: Uses Zai AI for intelligent recipe organization

## Technology Stack

- **Runtime**: Bun
- **Framework**: grammy (Telegram Bot API)
- **Language**: TypeScript (strict mode)
- **AI Service**: Zai API
- **Storage**: In-memory (extensible to database)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd telegram-chef
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
ZAI_API_KEY=your_zai_api_key_here
```

## Getting a Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions
3. Copy the bot token provided by BotFather
4. Paste it in your `.env` file

## Getting a Zai API Key

1. Visit [Zai](https://zai.com) and sign up
2. Navigate to your API settings
3. Generate an API key
4. Paste it in your `.env` file

## Usage

### Starting the Bot

```bash
bun run dev
# or
bun run start
```

### Type Checking

```bash
bun run typecheck
```

### Using the Bot

1. **Start the bot**: Send `/start` to begin
2. **Add a recipe**: Simply type your ingredients
   ```
   2 cups flour
   1 cup sugar
   3 eggs
   1 tsp vanilla
   ```
3. **Select category**: Choose from inline keyboard buttons
4. **Add title**: Provide a title or accept AI suggestion
5. **Attach photo**: Optional - attach a photo of the dish
6. **View recipes**: Use `/myrecipes` to see all your recipes

### Commands

- `/start` - Start the bot and see welcome message
- `/help` - Show help and commands
- `/myrecipes` - View all your recipes
- `/recipe <id>` - View a specific recipe
- `/cancel` - Cancel current operation

## Project Structure

```
telegram-chef/
├── src/
│   ├── bot/              # Telegram bot implementation
│   │   ├── handlers/     # Message handlers
│   │   ├── middleware/   # Bot middleware
│   │   └── keyboards/    # Inline keyboards
│   ├── services/         # Core services
│   │   ├── ai.ts        # AI service
│   │   └── storage.ts   # Storage service
│   ├── types/           # TypeScript types
│   ├── config/          # Configuration
│   └── utils/           # Utilities
├── plans/               # Architecture and plans
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## Development

### Type Safety

The project uses TypeScript with strict mode enabled. All types are defined in `src/types/`.

### Adding New Features

1. Define types in `src/types/`
2. Implement service logic in `src/services/`
3. Add handlers in `src/bot/handlers/`
4. Update documentation

### Testing

To test the bot locally:

1. Start the bot: `bun run index.ts`
2. Open Telegram and search for your bot
3. Interact with the bot to test features

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Your Telegram bot token from @BotFather |
| `ZAI_API_KEY` | Yes | Your Zai API key |
| `ZAI_API_ENDPOINT` | No | Zai API endpoint (default: https://api.zai.com/v1) |
| `NODE_ENV` | No | Environment (development/production) |

## Recipe Categories

The bot supports the following categories:

- 🍽️ Main Course
- 🥗 Appetizer
- 🍰 Dessert
- 🥤 Beverage
- 🍲 Soup
- 🥬 Salad
- 🍳 Breakfast
- 🍪 Snack
- 📦 Other

## Future Enhancements

- Database integration (PostgreSQL/SQLite)
- Recipe search and filtering
- Recipe sharing and import/export
- Nutritional analysis
- Ingredient substitution suggestions
- Multiple photos per recipe
- Voice note support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Acknowledgments

- Built with [grammy](https://grammy.dev/)
- Powered by [Zai AI](https://zai.com)
- Runtime: [Bun](https://bun.sh)
