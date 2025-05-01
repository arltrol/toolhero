# ToolHero

A simple Netlify-compatible web app to get AI tool recommendations using GPT-4.

## Features
- User enters a use case
- Serverless function fetches AI tool recommendations via OpenAI
- Uses Netlify Functions (`getTools.js`)
- Includes test endpoint (`hello.js`)

## Setup Instructions
1. Fork this repo or upload to GitHub
2. Connect to Netlify
3. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: your OpenAI key
   - Enable "Contains secret values"
4. Netlify will auto-deploy

## Test
- Visit `/result.html?useCase=sales`
- Or hit the function directly: `/.netlify/functions/hello`
