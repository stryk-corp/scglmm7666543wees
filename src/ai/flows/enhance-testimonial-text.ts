
'use server';

/**
 * @fileOverview AI-powered text enhancement for user testimonials.
 *
 * This file defines a Genkit flow to improve the grammar, clarity, and
 * overall quality of testimonial text.
 *
 * - enhanceTestimonialText - An async function that calls the enhancement flow.
 * - EnhanceTestimonialTextInput - The input type for the flow.
 * - EnhanceTestimonialTextOutput - The output type for the flow.
 */

import {ai, openAIModel} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceTestimonialTextInputSchema = z.object({
  text: z.string().describe('The user-provided testimonial text.'),
});
export type EnhanceTestimonialTextInput = z.infer<
  typeof EnhanceTestimonialTextInputSchema
>;

const EnhanceTestimonialTextOutputSchema = z.object({
  enhancedText: z.string().describe('The AI-enhanced version of the testimonial text.'),
});
export type EnhanceTestimonialTextOutput = z.infer<
  typeof EnhanceTestimonialTextOutputSchema
>;

const enhanceTestimonialTextPrompt = ai.definePrompt({
  name: 'enhanceTestimonialTextPrompt',
  input: {schema: EnhanceTestimonialTextInputSchema},
  output: {schema: EnhanceTestimonialTextOutputSchema},
  model: openAIModel,
  prompt: `You are an expert copyeditor. Your task is to enhance the following user-submitted testimonial.

    **Instructions:**
    1.  Correct any spelling and grammar mistakes.
    2.  Improve sentence structure and clarity for better readability.
    3.  Boost the impact and professionalism of the text.
    4.  **Crucially, you must preserve the original meaning and positive sentiment of the user's message.** Do not add new facts or change their core opinion.
    5.  Keep the tone authentic and genuine, as if the user wrote it themselves, just more polished.

    **Original Text:**
    "{{{text}}}"

    Return the result as a single JSON object with the key "enhancedText".
    `,
});

const enhanceTestimonialTextFlow = ai.defineFlow(
  {
    name: 'enhanceTestimonialTextFlow',
    inputSchema: EnhanceTestimonialTextInputSchema,
    outputSchema: EnhanceTestimonialTextOutputSchema,
  },
  async input => {
    if (!input.text.trim()) {
        return { enhancedText: "" };
    }
    
    const {output} = await enhanceTestimonialTextPrompt(input);
    
    if (!output) {
      throw new Error('Enhancement check failed. The AI returned empty content.');
    }
    
    return output;
  }
);

export async function enhanceTestimonialText(
  input: EnhanceTestimonialTextInput
): Promise<EnhanceTestimonialTextOutput> {
  return enhanceTestimonialTextFlow(input);
}
