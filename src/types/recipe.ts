export interface Recipe {
  id: string;
  name: string;
  cookingTime: string;
  ingredients: string[];
  instructions: string[];
  originalLanguage: 'en' | 'ru';
  youtubeUrl: string;
  transcript: string;
  createdAt: Date;
}

export interface ExtractedRecipe {
  name: string;
  cookingTime: string;
  ingredients: string[];
  instructions: string[];
  detectedLanguage: 'en' | 'ru';
}

export interface TranscriptResponse {
  content: string | TranscriptChunk[];
  lang: string;
  availableLangs: string[];
}

export interface TranscriptChunk {
  text: string;
  offset: number;
  duration: number;
  lang: string;
}

export interface YouTubeVideoInfo {
  videoId: string;
  url: string;
}

export interface SearchOptions {
  query: string;
  searchInIngredients?: boolean;
}
