# Troubleshooting Guide

## Common Issues and Solutions

### 1. Supadata API Error: Unauthorized

**Error Message:**
```
❌ Supadata error: Supadata API error: Unauthorized - {"error":"unauthorized","message":"Unauthorized","details":"Missing API Key"}
```

**Solution:**
- Check that `SUPADATA_API_KEY` is set in your `.env` file
- Verify the API key is correct
- Get a new API key from [Supadata Dashboard](https://dash.supadata.ai)

### 2. Z.AI API Error: Insufficient Balance

**Error Message:**
```
❌ AI processing error: Z.AI account has insufficient balance. Please add credits at https://z.ai/manage-apikey/apikey-list
```

**Solution:**
- Visit [Z.AI API Keys](https://z.ai/manage-apikey/apikey-list)
- Add credits to your account
- Choose a pricing plan that fits your needs

### 3. Invalid YouTube URL Format

**Error Message:**
```
❌ Supadata error: Invalid YouTube URL format
```

**Solution:**
- Make sure you're using a valid YouTube URL
- Supported formats:
  - `https://youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://youtube.com/shorts/VIDEO_ID`
  - `https://youtube.com/embed/VIDEO_ID`

### 4. Telegram Bot Error: Can't Parse Entities

**Error Message:**
```
BotError: GrammyError in middleware: Call to 'sendMessage' failed! (400: Bad Request: can't parse entities)
```

**Solution:**
- This has been fixed by switching to HTML parse mode
- Make sure you're using the latest version of the code

### 5. Transcript Not Available

**Error Message:**
```
❌ Transcript not available for this video.
```

**Solution:**
- Not all YouTube videos have transcripts available
- Try a different video
- Check if the video has captions/subtitles enabled

### 6. AI Processing Errors

**Error Message:**
```
❌ AI processing error: Failed to extract JSON from AI response
```

**Solution:**
- The AI couldn't parse the transcript properly
- Try a video with clearer audio/transcript
- Ensure the video is actually a cooking recipe

## Setup Checklist

Before running the bot, ensure:

- [ ] `.env` file exists in project root
- [ ] `TELEGRAM_BOT_TOKEN` is set (from @BotFather)
- [ ] `ZAI_API_KEY` is set (from Z.AI)
- [ ] `SUPADATA_API_KEY` is set (from Supadata)
- [ ] Z.AI account has sufficient balance
- [ ] Supadata API key is valid

## Testing the Bot

1. Start the bot: `bun run dev`
2. Send `/help` to see available commands
3. Test with a simple recipe video URL
4. Check console logs for any errors

## Console Logs

The bot now logs detailed information:

- 📡 Fetching transcript from Supadata API
- 🤖 Calling Z.AI API
- ✅ Success messages
- ❌ Error messages with status codes

Use these logs to debug issues.

## Getting Help

If you encounter issues not covered here:

1. Check the console logs for detailed error messages
2. Verify all API keys are correct
3. Ensure your accounts have sufficient balance
4. Try with a different YouTube video

## API Documentation

- [Supadata Documentation](https://docs.supadata.ai)
- [Z.AI Documentation](https://docs.z.ai)
