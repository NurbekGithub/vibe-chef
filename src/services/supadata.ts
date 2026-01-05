import type { TranscriptResponse, TranscriptChunk, YouTubeVideoInfo } from '../types/recipe.js';

export class SupadataError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'SupadataError';
  }
}

export class SupadataService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.supadata.ai/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Extract video ID from various YouTube URL formats
   */
  private extractVideoId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    throw new SupadataError('Invalid YouTube URL format');
  }

  /**
   * Validate YouTube URL
   */
  validateYouTubeUrl(url: string): YouTubeVideoInfo {
    try {
      const videoId = this.extractVideoId(url);
      return { videoId, url };
    } catch (error) {
      throw new SupadataError('Invalid YouTube URL format');
    }
  }

  /**
   * Fetch transcript from YouTube video
   * @param url - YouTube video URL or video ID
   * @param text - If true, return plain text transcript
   * @param lang - Preferred language code (ISO 639-1)
   */
  async getTranscript(
    url: string,
    text: boolean = true,
    lang?: string
  ): Promise<TranscriptResponse> {
    const videoInfo = this.validateYouTubeUrl(url);

    const queryParams = new URLSearchParams({
      url: videoInfo.url,
      text: text.toString(),
    });

    if (lang) {
      queryParams.append('lang', lang);
    }

    const endpoint = `${this.baseUrl}/youtube/transcript?${queryParams.toString()}`;

    try {
      console.log(`📡 Fetching transcript from Supadata API: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Supadata API error (${response.status}): ${errorText}`);
        throw new SupadataError(
          `Supadata API error: ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = await response.json() as any;
      
      // Check if the API returned an error object even with 200 status
      if (data.error) {
        console.error(`❌ Supadata API returned error object: ${data.error} - ${data.message}`);
        throw new SupadataError(
          `Transcript unavailable: ${data.message || data.error}`,
          404
        );
      }

      const transcriptResponse = data as TranscriptResponse;
      console.log(`✅ Successfully fetched transcript for video: ${videoInfo.videoId}`);
      return transcriptResponse;
    } catch (error) {
      if (error instanceof SupadataError) {
        throw error;
      }
      console.error(`❌ Failed to fetch transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new SupadataError(
        `Failed to fetch transcript: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get plain text transcript
   */
  async getPlainTextTranscript(url: string, lang?: string): Promise<string> {
    const response = await this.getTranscript(url, true, lang);

    if (typeof response.content === 'string') {
      return response.content;
    }

    // If content is an array, concatenate all text
    if (!response.content) {
      throw new SupadataError('Transcript content is undefined or null');
    }

    return response.content
      .map((chunk: TranscriptChunk) => chunk.text)
      .join(' ');
  }

  /**
   * Get structured transcript with timestamps
   */
  async getStructuredTranscript(url: string, lang?: string): Promise<TranscriptResponse> {
    return this.getTranscript(url, false, lang);
  }

  /**
   * Check if transcript is available for a video
   */
  async isTranscriptAvailable(url: string): Promise<boolean> {
    try {
      await this.getTranscript(url, true);
      return true;
    } catch (error) {
      if (error instanceof SupadataError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }
}
