import OpenAI from 'openai';
// OpenRouter exposes an OpenAI-compatible API, so the OpenAI SDK works with a different baseURL
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY
  });

// Call OpenRouter API for dream interpretation
export async function getDreamInterpretation(dreamText) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Server misconfigured: OPENAI_API_KEY is missing');
  }

  const model = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';

  try {
    const message = await openrouter.chat.completions.create({
      model,
      // Reasoning models spend part of this on hidden thinking, so leave room for the answer too
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: 'You are a thoughtful dream interpreter. Be insightful but gentle, and consider common dream symbolism. Keep your interpretation to 2-3 paragraphs.'
        },
        {
          role: 'user',
          content: `Dream: ${dreamText}`
        }
      ]
    });
    // Some models (e.g. reasoning models that hit max_tokens) return no content
    const content = message.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`Model ${model} returned an empty response`);
    }
    return content.trim();
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw new Error(`API error: ${error.message}`);
  }
}
