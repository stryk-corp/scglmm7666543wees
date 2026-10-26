'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ClassifierInputSchema = z.object({
  expectedRole: z.string(),
  allowedRoles: z.array(z.string()),
  text: z.string(),
});

const ClassifierOutputSchema = z.object({
  role: z.string(),
  reason: z.string(),
});

const classifierPrompt = ai.definePrompt({
  name: 'contractGatedRoleClassifierPrompt',
  input: { schema: ClassifierInputSchema },
  output: { schema: ClassifierOutputSchema },
  prompt: `Classify the prose's primary rhetorical function. Choose exactly one role from this allow-list:
{{#each allowedRoles}}{{this}}
{{/each}}

The active slot role is {{expectedRole}}. Do not assume the text belongs there. Choose the closest role based only on the supplied prose and briefly explain.
Prose:
"""
{{text}}
"""`,
});

export async function classifySlotRole(expectedRole: string, text: string, allowedRoles: string[]) {
  const response = await classifierPrompt({ expectedRole, text, allowedRoles });
  if (!response.output) throw new Error('The role-fit classifier returned no result.');
  return response.output;
}
