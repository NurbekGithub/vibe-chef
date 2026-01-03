export interface Config {
  telegramBotToken: string;
  zaiApiKey: string;
  zaiApiEndpoint: string;
  nodeEnv: 'development' | 'production';
}

export function loadConfig(): Config {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const zaiApiKey = process.env.ZAI_API_KEY;
  
  if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }
  
  if (!zaiApiKey) {
    throw new Error('ZAI_API_KEY is required');
  }
  
  return {
    telegramBotToken,
    zaiApiKey,
    zaiApiEndpoint: process.env.ZAI_API_ENDPOINT || 'https://api.zai.com/v1',
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  };
}
