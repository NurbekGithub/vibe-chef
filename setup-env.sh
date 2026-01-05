#!/bin/bash

# Setup script for Telegram Chef Bot environment variables

echo "🔧 Setting up environment for Telegram Chef Bot"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Please edit it manually."
    echo ""
    echo "Current .env file contents:"
    cat .env
else
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  Please edit .env file and add your API keys:"
    echo ""
    echo "Required API Keys:"
    echo "  1. TELEGRAM_BOT_TOKEN - Get from @BotFather on Telegram"
    echo "  2. ZAI_API_KEY - Get from https://z.ai/manage-apikey/apikey-list"
    echo "  3. SUPADATA_API_KEY - Get from https://dash.supadata.ai"
    echo ""
    echo "Edit the .env file and replace the placeholder values with your actual API keys."
fi

echo ""
echo "After adding your API keys, run: bun run dev"
