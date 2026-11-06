
'use server';

/**
 * @fileOverview Normalizes a university name to its official format using AI.
 *
 * This file defines a Genkit flow to ensure consistent naming for educational institutions.
 *
 * @exports normalizeUniversityName - An async function that calls the normalization flow.
 * @exports NormalizeUniversityNameInput - The input type for the flow.
 * @exports NormalizeUniversityNameOutput - The output type for the flow.
 */

import {ai, openAIModel} from '@/ai/genkit';
import {z} from 'genkit';

const NormalizeUniversityNameInputSchema = z.object({
  providedName: z.string().describe('The university name as provided by the user.'),
});

export type NormalizeUniversityNameInput = z.infer<typeof NormalizeUniversityNameInputSchema>;

const NormalizeUniversityNameOutputSchema = z.object({
  officialName: z.string().describe('The official, canonical name of the university.'),
});

export type NormalizeUniversityNameOutput = z.infer<typeof NormalizeUniversityNameOutputSchema>;

const normalizeUniversityNamePrompt = ai.definePrompt({
  name: 'normalizeUniversityNamePrompt',
  input: {schema: NormalizeUniversityNameInputSchema},
  output: {schema: NormalizeUniversityNameOutputSchema},
  model: openAIModel,
  prompt: `You are an expert data cleanser. Your task is to return the full, official name of a university based on the user-provided input.
    
    For example:
    - If the input is "unn", "uni nsukka", or "university of nsukka", the output should be "University of Nigeria, Nsukka".
    - If the input is "unilag", the output should be "University of Lagos".
    - If the input is "oau", the output should be "Obafemi Awolowo University".

    Return only the official name in the specified JSON format.

    User-provided name: "{{{providedName}}}"
    `,
});

const normalizeUniversityNameFlow = ai.defineFlow(
  {
    name: 'normalizeUniversityNameFlow',
    inputSchema: NormalizeUniversityNameInputSchema,
    outputSchema: NormalizeUniversityNameOutputSchema,
  },
  async input => {
    const {output} = await normalizeUniversityNamePrompt(input);
    if (!output) {
      throw new Error('Failed to normalize university name.');
    }
    return output;
  }
);

export async function normalizeUniversityName(
  input: NormalizeUniversityNameInput
): Promise<NormalizeUniversityNameOutput> {
  return normalizeUniversityNameFlow(input);
}
