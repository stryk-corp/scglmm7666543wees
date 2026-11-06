
'use server';

/**
 * @fileOverview AI-powered moderation for user-submitted testimonials.
 *
 * This file defines a Genkit flow that analyzes testimonial text and an
 * optional image to ensure they are appropriate for public display.
 *
 * - moderateTestimonial - An async function that orchestrates the moderation check.
 * - ModerateTestimonialInput - The input type for the flow.
 * - ModerateTestimonialOutput - The output type for the flow.
 */

import {ai, openAIModel} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateTestimonialInputSchema = z.object({
  testimonialText: z.string().describe('The text content of the testimonial.'),
  authorImageUrl: z.string().optional().describe('A data URI of the author\'s photo. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type ModerateTestimonialInput = z.infer<
  typeof ModerateTestimonialInputSchema
>;

const ModerateTestimonialOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the content is appropriate for the website.'),
  reason: z.string().describe('A brief reason for the decision, especially if inappropriate.'),
});
export type ModerateTestimonialOutput = z.infer<
  typeof ModerateTestimonialOutputSchema
>;

const moderationPrompt = ai.definePrompt({
  name: 'moderateTestimonialPrompt',
  input: {schema: ModerateTestimonialInputSchema},
  output: {schema: ModerateTestimonialOutputSchema},
  model: openAIModel,
  prompt: `You are a content moderator for a student-focused website. Your task is to review a user-submitted testimonial.

    **Moderation Rules:**
    1.  **Text Analysis:**
        - The primary goal is to filter for harmful content.
        - **Be lenient with short, positive comments.** Phrases like "Nice app!", "Cool!", or "lifesaver" are perfectly acceptable.
        - The text must NOT contain profanity, hate speech, spam, unrelated advertisements, or overtly negative/abusive language.
    2.  **Image Analysis:**
        - The image, if provided, must be appropriate for a professional website. A photo of a student holding their report is ideal.
        - It must NOT contain nudity, violence, hate symbols, or any other offensive material.

    **Your Task:**
    Analyze the following content and determine if it is appropriate based on the rules. Err on the side of approving content unless it clearly violates a rule.

    **User-Provided Content:**
    - Text: "{{{testimonialText}}}"
    {{#if authorImageUrl}}
    - Image: {{media url=authorImageUrl}}
    {{/if}}

    **Output:**
    Return a JSON object indicating if the content is appropriate.
    - If it is appropriate, set 'isAppropriate' to true and 'reason' to "Content is appropriate.".
    - If it is inappropriate, set 'isAppropriate' to false and provide a brief, user-friendly reason (e.g., "Text contains profanity," "Image is not suitable for the platform.").
    `,
});

const moderateTestimonialFlow = ai.defineFlow(
  {
    name: 'moderateTestimonialFlow',
    inputSchema: ModerateTestimonialInputSchema,
    outputSchema: ModerateTestimonialOutputSchema,
  },
  async input => {
    if (!input.testimonialText.trim()) {
        return { isAppropriate: false, reason: "Testimonial text cannot be empty." };
    }
    
    const {output} = await moderationPrompt(input);
    
    if (!output) {
      throw new Error('Moderation check failed. The AI returned empty content.');
    }
    
    return output;
  }
);

export async function moderateTestimonial(
  input: ModerateTestimonialInput
): Promise<ModerateTestimonialOutput> {
  return moderateTestimonialFlow(input);
}
