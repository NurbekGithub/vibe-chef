import { createBot } from './src/bot';

async function main() {
  try {
    const bot = await createBot();
    
    console.log('🤖 Telegram Chef Bot is starting...');
    
    await bot.start();
    
    console.log('✅ Bot is running!');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();
