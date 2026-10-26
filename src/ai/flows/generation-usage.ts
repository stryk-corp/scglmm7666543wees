import {z} from 'genkit';

export const GenerationTokenUsageSchema = z.object({
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
});

export type GenerationTokenUsage = z.infer<typeof GenerationTokenUsageSchema>;
