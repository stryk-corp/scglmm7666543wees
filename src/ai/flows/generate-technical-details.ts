'use server';

/**
 * @fileOverview AI-powered generation of technical details for a SIWES report.
 *
 * This file defines a Genkit flow that generates a cohesive set of technical
 * details (skills, technologies, etc.) based on a student's field of study.
 *
 * @exports generateTechnicalDetails - Orchestrates the generation of technical details.
 * @exports GenerateTechnicalDetailsInput - The input type for the flow.
 * @exports GenerateTechnicalDetailsOutput - The output type for the flow.
 */

import {ai, openAIModel} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTechnicalDetailsInputSchema = z.object({
  fieldOfStudy: z.string().describe('The student\'s field of study (e.g., "Computer Science", "Mechanical Engineering", "Law", "Medicine").'),
});

export type GenerateTechnicalDetailsInput = z.infer<
  typeof GenerateTechnicalDetailsInputSchema
>;

const GenerateTechnicalDetailsOutputSchema = z.object({
  primarySkill: z.string().describe('A relevant primary skill or competency for the field of study.'),
  technologiesUsed: z.string().describe('A comma-separated list of common tools, software, or methodologies used in this field.'),
  programmingLanguage: z.string().describe('A key software, legal standard, or primary tool used. (The key name "programmingLanguage" is kept for compatibility, but the content is generic).'),
  framework: z.string().describe('A relevant specialized tool, methodology, or framework. (The key name "framework" is kept for compatibility, but the content is generic).'),
  careerPath: z.string().describe('A typical career path for this field.'),
});

export type GenerateTechnicalDetailsOutput = z.infer<
  typeof GenerateTechnicalDetailsOutputSchema
>;

const technicalDetailsPrompt = ai.definePrompt({
  name: 'technicalDetailsPrompt',
  input: {schema: GenerateTechnicalDetailsInputSchema},
  output: {schema: GenerateTechnicalDetailsOutputSchema},
  model: openAIModel,
  prompt: `You are an expert career advisor and technical writer for university students across all disciplines. Based on the provided field of study, generate a realistic and cohesive set of professional details for a student's internship experience.

    **Field of Study:** {{{fieldOfStudy}}}

    **Instructions:**
    1.  **Primary Skill:** Suggest a core, high-level skill or competency a student would learn. Example for "Law": "Legal Research and Case Analysis". Example for "Mechanical Engineering": "CAD Modeling and Prototyping".
    2.  **Technologies Used:** Provide a comma-separated list of 4-6 relevant technologies, tools, software, or key methodologies. Example for "Law": "LexisNexis, Westlaw, Case Management Software, Legal Document Drafting, Client Interviewing".
    3.  **Key Software/Standard (for 'programmingLanguage' field):** Suggest a key piece of software, a governing standard, or a primary tool. Example for "Law": "Nigerian Bar Association (NBA) Standards". Example for "Medicine": "Electronic Health Record (EHR) Systems".
    4.  **Specialized Tool/Methodology (for 'framework' field):** Suggest a specialized tool or methodology. Example for "Law": "Moot Court Simulation". Example for "Civil Engineering": "AutoCAD Civil 3D".
    5.  **Career Path:** Suggest a common and desirable career path.

    Return the result as a single JSON object with the keys: 'primarySkill', 'technologiesUsed', 'programmingLanguage', 'framework', and 'careerPath'.
    `,
});

const generateTechnicalDetailsFlow = ai.defineFlow(
  {
    name: 'generateTechnicalDetailsFlow',
    inputSchema: GenerateTechnicalDetailsInputSchema,
    outputSchema: GenerateTechnicalDetailsOutputSchema,
  },
  async input => {
    const {output} = await technicalDetailsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate technical details. The AI returned empty content.');
    }
    return output;
  }
);

export async function generateTechnicalDetails(
  input: GenerateTechnicalDetailsInput
): Promise<GenerateTechnicalDetailsOutput> {
  return generateTechnicalDetailsFlow(input);
}
