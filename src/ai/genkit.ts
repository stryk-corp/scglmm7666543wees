import {genkit} from 'genkit';
import {openAI} from '@genkit-ai/compat-oai/openai';

export const openAIModel = openAI.model(
  process.env.OPENAI_MODEL ?? 'gpt-6-luna'
);

export const ai = genkit({
  plugins: [
    openAI({apiKey: process.env.OPENAI_API_KEY}),
  ],
  model: openAIModel,
});
