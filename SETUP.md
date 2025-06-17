# Environment Setup for Sigmapore Health App

## Required Environment Variables

To enable the Health AI chatbot, you need to set up your OpenAI API key:

### 1. Get OpenAI API Key
- Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
- Create a new API key
- Copy the key (starts with `sk-proj-...`)

### 2. Set Environment Variable

Create a `.env` file in the root directory:

```bash
# .env
EXPO_PUBLIC_OPENAI_API_KEY=your_actual_openai_api_key_here
```

**⚠️ Important:** 
- Never commit your `.env` file to git
- The `.env` file is already in `.gitignore`
- Use `EXPO_PUBLIC_` prefix for Expo environment variables

### 3. Alternative Setup

If you can't use environment variables, you can temporarily hardcode the API key in `App.tsx`:

```typescript
<ChatbotButton 
  openaiApiKey="your_actual_key_here"
  userLocation="Singapore"
/>
```

**⚠️ Security Warning:** Remove hardcoded keys before committing to git!

## Features Enabled
- 🤖 Health AI Chatbot with OpenAI GPT
- 📊 Hyperlocal health data analysis  
- 🗺️ GPS-precise dengue cluster detection
- 📈 Mathematical health predictions
- 📱 Real-time PSI and COVID data 