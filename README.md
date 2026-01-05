# Telegram Chef Bot

A Telegram bot that extracts recipes from YouTube videos, translates them to Russian, and allows users to search through saved recipes.

## Features

- 🎬 **YouTube Recipe Extraction**: Extract recipes from YouTube video links
- 📝 **Transcript Processing**: Uses Supadata API to extract video transcripts
- 🤖 **AI-Powered Analysis**: Uses Z.AI to parse transcripts and extract structured recipe data
- 🌐 **Automatic Translation**: Translates English recipes to Russian
- 🔍 **Recipe Search**: Search saved recipes by name or ingredients
- 💾 **In-Memory Storage**: Fast recipe storage (data lost on restart)
- 📱 **User-Friendly Interface**: Clean, formatted recipe cards

## Commands

- `/recipe <youtube_url>` - Extract and save recipe from YouTube video
- `/search <query>` - Search for saved recipes
- `/list` - List all saved recipes
- `/help` - Show help message

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your API keys in `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ZAI_API_KEY=your_zai_api_key_here
   ZAI_API_ENDPOINT=https://api.z.ai/api/coding/paas/v4
   SUPADATA_API_KEY=your_supadata_api_key_here
   SUPADATA_API_ENDPOINT=https://api.supadata.ai/v1
   NODE_ENV=development
   ```

## Getting API Keys

### Telegram Bot Token
1. Talk to [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot and get the token

### Z.AI API Key
1. Visit [Z.AI Open Platform](https://z.ai/model-api)
2. Create an account and get an API key from [API Keys](https://z.ai/manage-apikey/apikey-list)

### Supadata API Key
1. Visit [Supadata](https://supadata.ai)
2. Sign up and get your API key

## Usage

Start the bot:
```bash
bun run dev
```

Or:
```bash
bun run start
```

## How It Works

1. User sends a YouTube recipe video URL to the bot
2. Bot validates the URL and extracts the video ID
3. Supadata API fetches the video transcript
4. Z.AI analyzes the transcript and extracts:
   - Recipe name
   - Cooking time
   - Ingredients list
   - Cooking instructions
5. If the recipe is in English, it's translated to Russian
6. Recipe is saved to in-memory storage
7. Formatted recipe card is sent to the user

## Project Structure

```
telegram-chef/
├── src/
│   ├── bot/
│   │   ├── index.ts              # Main bot initialization
│   │   └── handlers/
│   │       ├── recipe.ts         # Recipe command handlers
│   │       └── search.ts         # Search command handlers
│   ├── services/
│   │   ├── supadata.ts           # YouTube transcript extraction
│   │   ├── ai.ts                 # Z.AI integration
│   │   └── storage.ts            # In-memory recipe storage
│   ├── types/
│   │   └── recipe.ts             # Recipe type definitions
│   └── config/
│       └── index.ts              # Configuration management
├── plans/
│   └── youtube-recipe-extraction.md
├── index.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Development

Run type checking:
```bash
bun run typecheck
```

## Notes

- **In-Memory Storage**: All recipes are stored in memory and will be lost when the bot restarts
- **API Rate Limits**: Be aware of rate limits for both Supadata and Z.AI APIs
- **Transcript Availability**: Not all YouTube videos have transcripts available
- **Language Detection**: The bot automatically detects the recipe language and translates English recipes to Russian

## Troubleshooting

### Bot doesn't start
- Check that all required environment variables are set in `.env`
- Verify your API keys are correct
- Check the console for error messages

### Recipe extraction fails
- Ensure the YouTube video has a transcript available
- Check your Supadata API key and quota
- Verify the YouTube URL format is correct

### AI processing fails
- Check your Z.AI API key and quota
- Ensure the transcript is long enough (minimum 50 characters)
- Check the console for detailed error messages

## License

MIT
