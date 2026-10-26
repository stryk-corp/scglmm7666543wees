'use server';

/**
 * @fileOverview AI-powered generation of SIWES report's "Chapter 5".
 *
 * This file defines a Genkit flow and prompt to generate the content for Chapter 5.
 *
 * @module src/ai/flows/generate-chapter-five
 *
 * @exports generateChapterFive - An async function that orchestrates the generation of the chapter.
 * @exports GenerateChapterFiveInput - The input type for the generateChapterFive function.
 * @exports GenerateChapterFiveOutput - The output type for the generateChapterFive function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {GenerationTokenUsageSchema} from './generation-usage';

const GenerateChapterFiveInputSchema = z.object({
  reportTitle: z.string().optional().describe('The report topic or title.'),
  fullName: z.string().describe("The student's full name."),
  universityName: z.string().describe("The name of the university."),
  placeOfAttachment: z.string().describe('The name of the place of attachment.'),
  fieldOfStudy: z.string().describe('The field of study.'),
  primarySkill: z.string().describe('The primary skill acquired during the attachment.'),
  technologiesUsed: z.string().describe('The technologies used.'),
  careerPath: z.string().describe('The desired career path.'),
  projectsDescription: z.string().optional().describe('A manual description of the projects worked on.'),
  referenceStyle: z.enum(['APA', 'MLA', 'Chicago', 'Harvard']).optional().default('APA').describe('The citation style for the references.'),
  isHumanized: z.boolean().optional().default(true).describe('If true, the output should be highly structured, detailed, and use a first-person narrative.'),
  targetWordCount: z.number().optional().describe('Target word count budget for page limit management.'),
  documentType: z.string().optional().describe('Document type: term_paper, essay, or siwes_report.'),
});

export type GenerateChapterFiveInput = z.infer<
  typeof GenerateChapterFiveInputSchema
>;

const GenerateChapterFiveOutputSchema = z.object({
  challengesText: z.string().describe('The generated content for the challenges section, formatted in markdown.'),
  conclusionText: z.string().describe('The generated content for the conclusion and recommendations sections, formatted in markdown.'),
  referencesText: z.string().describe('A generated list of relevant academic and technical references.'),
});

export type GenerateChapterFiveOutput = z.infer<
  typeof GenerateChapterFiveOutputSchema
>;

const GenerateChapterFiveFlowOutputSchema =
  GenerateChapterFiveOutputSchema.extend({
    tokenUsage: GenerationTokenUsageSchema,
  });

export type GenerateChapterFiveResult = z.infer<
  typeof GenerateChapterFiveFlowOutputSchema
>;

const chapterFivePrompt = ai.definePrompt({
  name: 'chapterFivePrompt',
  input: {schema: GenerateChapterFiveInputSchema},
  output: {schema: GenerateChapterFiveOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert AI assistant for writing academic reports and concluding sections.
    Based on the data provided, generate the content for this chapter/section.
    {{#if reportTitle}}
    Keep the generated discussion and conclusion focused on the document topic: "{{{reportTitle}}}".
    {{/if}}

    {{#if targetWordCount}}
    **PAGE TARGET:**
    Aim for approximately {{targetWordCount}} words combined across challenges, conclusion, recommendations, and references (within about 10%). This is a content target, not a maximum: complete each section and do not stop substantially short. Keep the discussion specific and avoid repetition or filler.
    {{/if}}

    Vary your wording and sentence structure to ensure the output is unique and passes plagiarism checks.

    {{#if isHumanized}}
    
    ### Humanized Content Instructions:
    The user has selected the "Humanized" option. This means you must generate a highly structured, deeply reflective, and comprehensive chapter from a first-person perspective. The output MUST be a single string containing markdown.

    **Structure and Formatting:**
    - Use '###' for main section titles (e.g., '### 5.1 Challenges Encountered and Solutions').
    - Use '####' for sub-section titles (e.g., '#### 5.1.1 Technical Challenges').
    - Use each section number exactly once and follow the listed 5.1, 5.2, and 5.3 structure; do not repeat a number in a heading.
    - Use markdown bullet points ('- ') for lists.
    - Write in a natural, first-person narrative ("I encountered...", "My understanding grew when...").
    - Ensure each section is exceptionally detailed and provides deep insights.

    **"Challenges Encountered and Solutions" (Section 5.1):** (for the 'challengesText' field)
    - Create a main heading '### 5.1 Challenges Encountered and Solutions'.
    - Create sub-sections for different categories of challenges (e.g., '#### 5.1.1 Technical Challenges', '#### 5.1.2 Project Management and Teamwork Challenges', '#### 5.1.3 Personal and Professional Growth Challenges').
    - Under each sub-section, use bullet points to list specific challenges. For each bullet point, elaborate in detail on:
      - The specific problem I faced (e.g., "Adapting to the {{{primarySkill}}} standard for a client project.").
      - The impact it had on my work.
      - The concrete steps I took to solve it (e.g., "I dedicated evenings to studying the official documentation, sought mentorship from a senior colleague, and built small-scale prototypes.").
      - What I learned from the experience.

    **"Conclusion and Recommendations" (for the 'conclusionText' field):**
    - Create a main heading '### 5.2 Conclusion'.
    - This is a final, reflective chapter, not just a brief summary.
    - Create sub-sections like '#### 5.2.1 Summary of Industrial Training', '#### 5.2.2 Correlation of Academic Knowledge with Practical Experience', and '#### 5.2.3 Impact on My Career Trajectory'.
    - **Summary:** Provide a comprehensive recap of my internship at **{{{placeOfAttachment}}}**. Reiterate the goals of the SIWES program and how my experience met them.
    - **Correlation:** Go into extensive detail about how theoretical concepts from my **{{{fieldOfStudy}}}** coursework at **{{{universityName}}}** were applied and illuminated by practical tasks. Give specific examples.
    - **Career Impact:** Reflect deeply on how the internship has shaped my professional ambitions in **{{{careerPath}}}**. Discuss future plans for skill development based on this experience.
    - Create a main heading '### 5.3 Recommendations'.
    - Provide separate, detailed recommendations for the company, the university, and future SIWES students using sub-headings ('#### To the Company', '#### To the University', '#### To Future SIWES Students'). Use bullet points under each for clarity.
    
    {{else}}

    ### Standard Content Instructions:
    The output must use a formal, professional tone with three main sections, formatted with '###' markdown headings.

    **"### 5.1 Challenges Encountered and Solutions":** (for the 'challengesText' field)
    - This section must be a long and detailed paragraph.
    - Brainstorm and elaborate on a range of realistic challenges a student might face during an internship in **{{{fieldOfStudy}}}**.
    - For each challenge, provide a detailed description, explain its impact, and describe the steps taken to overcome it.
    - Cover technical challenges (learning {{{primarySkill}}}), project management issues, interpersonal dynamics, and resource constraints.

    **"### 5.2 Conclusion" and "### 5.3 Recommendations":** (for the 'conclusionText' field)
    - This section must contain two headings: '### 5.2 Conclusion' and '### 5.3 Recommendations'.
    - Under '### 5.2 Conclusion', write a long and detailed paragraph. Structure it to cover: a summary of the experience at **{{{placeOfAttachment}}}**, an overview of skills gained (technical like **{{{technologiesUsed}}}** and soft skills), the impact on career goals in **{{{careerPath}}}**, and the relevance of the training to academic studies at **{{{universityName}}}**.
    - Under '### 5.3 Recommendations', write a paragraph providing general recommendations.

    {{/if}}

    **Data Provided:**
    - Student Name: {{{fullName}}}
    - University: {{{universityName}}}
    - Place of Attachment: {{{placeOfAttachment}}}
    - Field of Study: {{{fieldOfStudy}}}
    - Primary Skill: {{{primarySkill}}}
    - Technologies Used: {{{technologiesUsed}}}
    - Career Path: {{{careerPath}}}
    - Projects Worked On: {{{projectsDescription}}}
    - Reference Style: {{{referenceStyle}}}

    **Output Instructions:**
    1.  Generate the content for challenges for the 'challengesText' field.
    2.  Generate the content for conclusion and recommendations for the 'conclusionText' field.
    3.  Generate a list of 5-7 relevant academic and technical references for the 'referencesText' field. Each reference must be on a new line and formatted in the requested {{{referenceStyle}}} style.
    
    Return the final result as a single JSON object.
    `,
});

const generateChapterFiveFlow = ai.defineFlow(
  {
    name: 'generateChapterFiveFlow',
    inputSchema: GenerateChapterFiveInputSchema,
    outputSchema: GenerateChapterFiveFlowOutputSchema,
  },
  async input => {
    const response = await chapterFivePrompt(input);
    const {output} = response;

    if (!output) {
      throw new Error(
        'Failed to generate Chapter 5. The AI returned empty content.'
      );
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

export async function generateChapterFive(
  input: GenerateChapterFiveInput
): Promise<GenerateChapterFiveResult> {
  return generateChapterFiveFlow(input);
}
