# API Integration Fixes

## Z.AI API Integration Fix

### Problem

The Z.AI integration was failing because the API key was for the **GLM Coding Plan**, but the code was using the general API endpoint.

### Issues Identified

1. **Wrong API Endpoint**: Using `https://api.z.ai/api/paas/v4` (general endpoint) instead of `https://api.z.ai/api/coding/paas/v4` (coding plan endpoint)
2. **Markdown-formatted JSON**: The AI was returning JSON wrapped in markdown code blocks instead of pure JSON
3. **Fragile JSON Parsing**: Using simple regex to extract JSON, which could fail with various response formats
4. **Missing Response Format Parameter**: Not using the `response_format` parameter to force JSON output

## Solution

### 1. Updated API Endpoint

**File**: `src/services/ai.ts`

Changed the default base URL from:
```typescript
baseUrl: string = 'https://api.z.ai/api/paas/v4'
```

To:
```typescript
baseUrl: string = 'https://api.z.ai/api/coding/paas/v4'
```

This ensures the coding plan API key works correctly.

### 2. Added Response Format Parameter

Modified the [`chatCompletion()`](src/services/ai.ts:24) method to accept a `forceJson` parameter:

```typescript
private async chatCompletion(
  messages: Array<{ role: string; content: string }>,
  forceJson: boolean = false
): Promise<string>
```

When `forceJson` is `true`, the request includes:
```typescript
{
  model: this.model,
  messages,
  temperature: 0.7,
  response_format: { type: "json_object" }  // Forces JSON output
}
```

This tells the Z.AI API to return pure JSON instead of markdown-formatted text.

### 3. Improved JSON Parsing

Updated both [`extractRecipe()`](src/services/ai.ts:109) and [`translateToRussian()`](src/services/ai.ts:186) methods with robust JSON parsing:

```typescript
// Try to parse the response as JSON directly first
let recipe: ExtractedRecipe;
try {
  recipe = JSON.parse(response);
} catch (directParseError) {
  // If direct parse fails, try to extract JSON from markdown code blocks
  console.warn('⚠️ Direct JSON parse failed, attempting to extract from markdown');
  const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                   response.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    console.error('❌ Response content:', response.substring(0, 500));
    throw new AIServiceError('Failed to extract JSON from AI response. Response was not valid JSON.');
  }

  recipe = JSON.parse(jsonMatch[1] || jsonMatch[0]);
}
```

This provides a fallback mechanism:
1. First tries to parse the response as direct JSON
2. If that fails, extracts JSON from markdown code blocks (handles both ```json``` and ``` blocks)
3. As a last resort, uses the original regex pattern
4. Provides detailed error logging for debugging

### 4. Enhanced System Prompts

Updated system prompts to explicitly request pure JSON:

```typescript
const systemPrompt = `You are a professional cooking assistant. Analyze the following YouTube video transcript and extract recipe information in JSON format.

You must respond with valid JSON only. Do not include any markdown formatting, code blocks, or additional text.

JSON format:
{
  "name": "Recipe name",
  ...
}
...
```

### 5. Updated Response Type Interface

Added proper TypeScript interface for the Z.AI API response:

```typescript
const data = await response.json() as {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};
```

This includes all response fields and token usage information for better debugging.

### 6. Added Token Usage Logging

Enhanced logging to track token usage:

```typescript
console.log(`✅ Z.AI response received (${content.length} chars)`);
console.log(`📊 Token usage: ${data.usage?.total_tokens || 'N/A'} total`);
```

## Usage

The changes are backward compatible. The [`AIService`](src/services/ai.ts:10) can be instantiated with either endpoint:

```typescript
// For coding plan API keys (default)
const ai = new AIService(apiKey);

// For general API keys
const ai = new AIService(apiKey, 'https://api.z.ai/api/paas/v4');
```

## Testing

To test the changes:

1. Ensure your `.env` file contains a valid Z.AI API key for the coding plan
2. Run the bot and try extracting a recipe from a YouTube video
3. Check the console logs for:
   - API endpoint being called
   - Token usage information
   - Any JSON parsing warnings

## Benefits

1. **Correct API Usage**: Uses the appropriate endpoint for coding plan API keys
2. **Reliable JSON Parsing**: Multi-layered fallback ensures JSON is extracted correctly
3. **Better Error Messages**: Detailed logging helps diagnose issues quickly
4. **Token Usage Tracking**: Monitor API usage and costs
5. **Backward Compatible**: Works with both coding plan and general API keys

## References

- [Z.AI API Documentation - Coding Endpoint](https://github.com/context7/z_ai/blob/main/api-reference.md)
- [Z.AI Chat Completions API](https://github.com/context7/z_ai/blob/main/api-reference/llm/chat-completion.md)
- [Z.AI Response Format](https://github.com/context7/z_ai/blob/main/api-reference/llm/chat-completion.md)

---

## Supadata API Error Handling Fix

### Problem

The application was crashing with error: `undefined is not an object (evaluating 'response.content.map')` when trying to extract transcripts from YouTube videos.

### Root Cause

The Supadata API was returning a 200 OK status with an error object instead of expected transcript data when a video has no available transcript:

```json
{
  "error": "transcript-unavailable",
  "message": "Transcript Unavailable",
  "details": "No transcript is available for this video",
  "documentationUrl": "https://docs.supadata.ai/errors/transcript-unavailable"
}
```

This bypassed the existing error handling that only checked for non-200 status codes.

### Solution

**File**: `src/services/supadata.ts`

Added error detection after successful HTTP response in the [`getTranscript()`](src/services/supadata.ts:56) method:

```typescript
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
```

### Benefits

1. **Proper Error Handling**: Catches transcript unavailability errors even with 200 OK status
2. **User-Friendly Messages**: Provides clear error messages to users
3. **Prevents Crashes**: Stops the application from crashing when videos don't have transcripts
4. **Better Debugging**: Logs detailed error information for troubleshooting

### Error Flow

When a video has no transcript:
1. Supadata API returns 200 OK with error object
2. Code detects `data.error` field
3. Throws `SupadataError` with clear message
4. Bot handler catches error and displays user-friendly message
5. User sees: "❌ Transcript not available for this video."
