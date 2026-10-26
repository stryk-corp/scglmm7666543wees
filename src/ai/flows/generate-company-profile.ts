
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a company profile with Gemini.
 *
 * It includes:
 * - generateCompanyProfile - A function that generates a company profile.
 * - GenerateCompanyProfileInput - The input type for the generateCompanyProfile function.
 * - GenerateCompanyProfileOutput - The output type for the generateCompanyProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCompanyProfileInputSchema = z.object({
  placeOfAttachment: z
    .string()
    .describe('The name of the company to generate a profile for.'),
});
export type GenerateCompanyProfileInput = z.infer<
  typeof GenerateCompanyProfileInputSchema
>;

const GenerateCompanyProfileOutputSchema = z.object({
  profile: z.string().describe('A concise, professional company profile.'),
  services: z.array(z.string()).describe("A list of the company's main services."),
  attachmentLocation: z.string().optional().describe("The company's physical address."),
  ceoName: z.string().optional().describe("The name of the company's CEO or a key leader."),
  companyVision: z.string().optional().describe("The company's vision statement."),
  companyMission: z.string().optional().describe("The company's mission statement."),
  companyValues: z.string().optional().describe("The company's core values."),
});
export type GenerateCompanyProfileOutput = z.infer<
  typeof GenerateCompanyProfileOutputSchema
>;

export async function generateCompanyProfile(
  input: GenerateCompanyProfileInput
): Promise<GenerateCompanyProfileOutput> {
  return generateCompanyProfileFlow(input);
}


const generateCompanyProfileFlow = ai.defineFlow(
  {
    name: 'generateCompanyProfileFlow',
    inputSchema: GenerateCompanyProfileInputSchema,
    outputSchema: GenerateCompanyProfileOutputSchema,
  },
  async ({ placeOfAttachment }) => {
    
    const analysisPrompt = ai.definePrompt({
      name: 'generateCompanyProfileFromKnowledge',
      input: { schema: z.object({ placeOfAttachment: z.string() }) },
      output: { schema: GenerateCompanyProfileOutputSchema },
      model: 'googleai/gemini-2.5-flash',
      prompt: `You are a careful business analyst. Generate a concise profile for the company or organization "{{placeOfAttachment}}" using your existing knowledge.

  Do not claim to have searched the web. Do not invent facts. Include services only when you have a reasonable basis for them. Leave optional location, CEO, vision, mission, and values fields as empty strings unless you know the specific information with confidence. If you do not know this organization, provide a brief neutral profile that says its details could not be verified, and return an empty services list. Never return null or the text "null" for any field.

  Return the requested structured output.`,
    });

    const { output } = await analysisPrompt({ placeOfAttachment });

    if (!output) {
      throw new Error('Failed to generate company profile.');
    }

    return output;
  }
);
