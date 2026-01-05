export interface Config {
  telegramBotToken: string;
  zaiApiKey: string;
  zaiApiEndpoint: string;
  supadataApiKey: string;
  supadataApiEndpoint: string;
  nodeEnv: string;
}

export function getConfig(): Config {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const zaiApiKey = process.env.ZAI_API_KEY;
  const zaiApiEndpoint = process.env.ZAI_API_ENDPOINT;
  const supadataApiKey = process.env.SUPADATA_API_KEY;
  const supadataApiEndpoint = process.env.SUPADATA_API_ENDPOINT || 'https://api.supadata.ai/v1';
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }

  if (!zaiApiKey) {
    throw new Error('ZAI_API_KEY is required');
  }

  if (!supadataApiKey) {
    throw new Error('SUPADATA_API_KEY is required');
  }

  return {
    telegramBotToken,
    zaiApiKey,
    zaiApiEndpoint,
    supadataApiKey,
    supadataApiEndpoint,
    nodeEnv,
  };
}
