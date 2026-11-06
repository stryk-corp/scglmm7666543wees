'use server';

/**
 * @fileOverview AI-powered generation of SIWES report's "Chapter 4: Project Developed".
 *
 * This file defines a Genkit flow that takes a simple description of projects
 * and expands it into a fully-structured chapter.
 *
 * @exports generateChapterFour - An async function that orchestrates the chapter generation.
 * @exports GenerateChapterFourInput - The input type for the generateChapterFour function.
 * @exports GenerateChapterFourOutput - The output type for the generateChapterFour function.
 */

import {ai, openAIModel} from '@/ai/genkit';
import {z} from 'genkit';
import {GenerationTokenUsageSchema} from './generation-usage';

const GenerateChapterFourInputSchema = z.object({
  reportTitle: z.string().optional().describe('The report topic or title.'),
  projectsDescription: z.string().describe('A simple, user-provided description of the projects worked on.'),
  technologiesUsed: z.string().describe('The technologies used, for context.'),
  targetWordCount: z.number().optional().describe('Target word count budget for page limit management.'),
  documentType: z.string().optional().describe('Document type: term_paper, essay, or siwes_report.'),
});

export type GenerateChapterFourInput = z.infer<typeof GenerateChapterFourInputSchema>;

const GenerateChapterFourOutputSchema = z.object({
  projectIntro: z.string().describe("A brief, generated introduction to all projects."),
  project1_intro: z.string().describe("Introduction for the first project."),
  project1_desc: z.string().describe("Detailed description of the first project."),
  project1_welcomeScreen: z.string().describe("Description of a key feature or screen of the first project."),
  project1_signInScreen: z.string().describe("Description of another feature or screen of the first project."),
  project1_validation: z.string().describe("Description of challenges and solutions for the first project."),
  project1_signUpScreen: z.string().describe("Description of another part of the first project."),
  project1_homeScreen: z.string().describe("Description of the final state or main view of the first project."),
  project1_tools: z.string().describe("A list of tools and technologies used for the first project."),
  project2_intro: z.string().optional().describe("Introduction for the second project, if applicable."),
  project2_desc: z.string().optional().describe("Detailed description of the second project, if applicable."),
  project2_structure: z.string().optional().describe("Description of the second project's structure."),
  project2_ui: z.string().optional().describe("Description of the second project's UI/UX."),
  project2_core: z.string().optional().describe("Description of the second project's core functionality."),
  project2_tools: z.string().optional().describe("A list of tools and technologies used for the second project."),
});

export type GenerateChapterFourOutput = z.infer<typeof GenerateChapterFourOutputSchema>;

const GenerateChapterFourFlowOutputSchema =
  GenerateChapterFourOutputSchema.extend({
    tokenUsage: GenerationTokenUsageSchema,
  });

export type GenerateChapterFourResult = z.infer<
  typeof GenerateChapterFourFlowOutputSchema
>;

const chapterFourPrompt = ai.definePrompt({
  name: 'chapterFourPrompt',
  input: {schema: GenerateChapterFourInputSchema},
  output: {schema: GenerateChapterFourOutputSchema},
  model: openAIModel,
  prompt: `You are an expert AI assistant for writing academic projects and technical chapters.
    Based on the user's description, generate the structured content for this section.
    {{#if reportTitle}}
    The document topic is "{{{reportTitle}}}". Keep all generated content focused on this topic.
    {{/if}}

    {{#if targetWordCount}}
    **PAGE TARGET:**
    Aim for approximately {{targetWordCount}} words combined across all generated fields (within about 10%). This is a content target, not a maximum: develop each applicable project section fully and do not stop substantially short. Stay relevant and avoid repetition or filler.
    {{/if}}

    **User's Project Description:**
    "{{{projectsDescription}}}"

    **Technologies Mentioned:**
    "{{{technologiesUsed}}}"

    **Instructions:**
    1.  **Analyze the Input:** Read the user's description and identify the distinct projects (usually 1 or 2).
    2.  **Generate Overall Introduction ('projectIntro'):** Write a brief introductory paragraph that summarizes all the projects developed during the SIWES training.
    3.  **Flesh out Each Project:** For each identified project, generate detailed content for all the corresponding output fields (e.g., 'project1_intro', 'project1_desc', etc.).
    4.  **Be Detailed and Technical:** Elaborate significantly on the user's input. Infer common features, architecture, and development practices based on the project type and technologies mentioned. For example, if they mention a "dashboard," talk about APIs, data visualization, authentication, etc. If they mention a "blog," discuss static site generation, Markdown, and SEO.
    5.  **Structure the Content:** Ensure each field contains a well-written paragraph or two. Do not use markdown headings.
    6.  **Handle One or Two Projects:** If the user only describes one project, only fill out the 'project1' fields and leave the 'project2' fields empty. If they describe two, fill out both.
    7.  **Tools and Technologies:** For the 'tools' fields (e.g., 'project1_tools'), list the relevant technologies from the user's input and infer others that are commonly used with them. Format it as a simple sentence, e.g., "Tools used: Next.js, TypeScript, Chart.js, Node.js, Express, PostgreSQL, Docker."
    8.  **Natural Academic Voice:** Use clear, natural prose that sounds like a knowledgeable student. Use first person only when supported by the student's description, and do not invent personal experiences.
    
    Return the final result as a single JSON object matching the output schema.
    `,
});

const generateChapterFourFlow = ai.defineFlow(
  {
    name: 'generateChapterFourFlow',
    inputSchema: GenerateChapterFourInputSchema,
    outputSchema: GenerateChapterFourFlowOutputSchema,
  },
  async (input) => {
    const response = await chapterFourPrompt(input);
    const {output} = response;

    if (!output) {
      throw new Error('Failed to generate Chapter 4. The AI returned empty content.');
    }
    
    return {
      ...output,
      tokenUsage: {
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
      },
    };
  }
);

export async function generateChapterFour(
  input: GenerateChapterFourInput
): Promise<GenerateChapterFourResult> {
  return generateChapterFourFlow(input);
}
