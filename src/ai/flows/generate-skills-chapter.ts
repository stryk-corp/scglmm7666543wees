'use server';

/**
 * @fileOverview AI-powered generation of SIWES report's "Skills Learnt" chapter.
 *
 * This file defines a Genkit flow and prompt to generate the content for Chapter 3.
 *
 * @module src/ai/flows/generate-skills-chapter
 *
 * @exports generateSkillsChapter - An async function that orchestrates the generation of the chapter.
 * @exports GenerateSkillsChapterInput - The input type for the generateSkillsChapter function.
 * @exports GenerateSkillsChapterOutput - The output type for the generateSkillsChapter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {GenerationTokenUsageSchema} from './generation-usage';

const GenerateSkillsChapterInputSchema = z.object({
  reportTitle: z.string().optional().describe('The report topic or title.'),
  primarySkill: z.string().describe('The primary skill or competency acquired during the attachment.'),
  fieldOfStudy: z.string().describe('The field of study (e.g., Law, Engineering, Medicine).'),
  technologiesUsed: z.string().describe('The tools, software, or methodologies used.'),
  programmingLanguage: z.string().describe('A key software, standard, or primary tool used.'),
  framework: z.string().describe('A specialized tool, methodology, or framework used.'),
  isHumanized: z.boolean().optional().default(true).describe('If true, the output should be highly structured and use a first-person narrative.'),
  targetWordCount: z.number().optional().describe('Target word count budget for page limit management.'),
  documentType: z.string().optional().describe('Document type: term_paper, essay, or siwes_report.'),
});

export type GenerateSkillsChapterInput = z.infer<
  typeof GenerateSkillsChapterInputSchema
>;

const GenerateSkillsChapterOutputSchema = z.object({
  skillsChapterText: z.string().describe('The generated content for the skills learnt chapter.'),
});

export type GenerateSkillsChapterOutput = z.infer<
  typeof GenerateSkillsChapterOutputSchema
>;

const GenerateSkillsChapterFlowOutputSchema =
  GenerateSkillsChapterOutputSchema.extend({
    tokenUsage: GenerationTokenUsageSchema,
  });

export type GenerateSkillsChapterResult = z.infer<
  typeof GenerateSkillsChapterFlowOutputSchema
>;

const skillsChapterPrompt = ai.definePrompt({
  name: 'skillsChapterPrompt',
  input: {schema: GenerateSkillsChapterInputSchema},
  output: {schema: GenerateSkillsChapterOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert AI assistant for writing academic reports (SIWES, Term Papers, and Essays) for any academic discipline.
    Based on the data provided, generate the content for this chapter/section.
    {{#if reportTitle}}
    Keep the chapter focused on the document topic: "{{{reportTitle}}}".
    {{/if}}

    {{#if targetWordCount}}
    **PAGE TARGET:**
    Aim for approximately {{targetWordCount}} words in this chapter (within about 10%). This is a content target, not a maximum: develop the required sections fully and do not stop substantially short. Stay focused and avoid repetition or filler.
    {{/if}}

    **Critical Instruction: The content must be tailored to the student's field of study. Vary your wording and sentence structure to ensure the output is unique and passes plagiarism checks.**

    {{#if isHumanized}}
    
    ### Humanized Content Instructions:
    The user has selected the "Humanized" option. This means you must generate a highly structured and detailed chapter from a reflective, first-person perspective.

    **Structure and Formatting:**
    - Use multiple levels of headings (e.g., '### 3.1', '#### 3.1.1', '#### 3.1.2').
    - Use each section number exactly once. Follow the listed 3.1 and 3.2 skeleton; do not repeat a number in a heading.
    - Incorporate bulleted lists to break down points and make the content easier to read.
    - Write from a first-person narrative ("I learned...", "This experience taught me..."). Weave in reflections on the learning process. Instead of just listing facts, explain the "aha!" moments and how theoretical knowledge connected with practical application.
    - Follow the page target above when provided. If there is no target, write approximately 1000-1500 words.

    **"Description of Skills" (Section 3.1):**
    - Create a main section '### 3.1 Description of Core Competencies'.
    - Create a sub-section for the primary skill, e.g., '#### 3.1.1 Mastering {{{primarySkill}}}'.
      - Elaborate in great detail on the process of learning this skill. For Law: "analyze complex legal precedents"; for Engineering: "design and simulate mechanical components". Discuss the 'why' behind the techniques.
    - Create another sub-section for soft skills, e.g., '#### 3.1.2 Development of Professional and Soft Skills'.
      - Use bullet points to list skills like:
        - **Teamwork and Collaboration:** Describe specific team projects and your role.
        - **Problem-Solving:** Detail a specific problem you solved.
        - **Professional Communication:** Mention how you improved in writing emails, presenting findings, or communicating with clients/colleagues.

    **"Tools and Methodologies" (Section 3.2):**
    - Create a main section '### 3.2 Proficiency in Tools and Methodologies'.
    - Create a sub-section for the primary tools, e.g., '#### 3.2.1 Application of Key Technologies'.
      - Discuss the main tools mentioned: **{{{technologiesUsed}}}**.
      - Explain how you used the **'{{{programmingLanguage}}}'** as a core standard/software.
      - Detail your experience with the **'{{{framework}}}'** methodology/tool. For each, explain *how* it was used in a professional context. For example: For Engineering: "I utilized AutoCAD to draft detailed schematics for the 'Project X' component, adhering to the ISO 8888 standard for technical product documentation."
    - Create another sub-section '#### 3.2.2 Workflow and Project Management Tools'.
      - Use bullet points to discuss ancillary tools (e.g., Jira, Trello, Git, specific legal or medical databases). Explain their role in your daily workflow.

    {{else}}

    ### Standard Content Instructions:
    The output must use a natural, humanized professional tone with two main sections, formatted with markdown '###' headings. Follow the page target above when provided; otherwise, provide enough detail for a complete chapter.

    **"### 3.1 Description of Skills":**
    - This section should be a long and detailed paragraph.
    - Describe the intensive program to develop and master skills in **{{{primarySkill}}}**, a cornerstone competency in **{{{fieldOfStudy}}}**.
    - Explain how the training moved beyond theory to practical application in a professional, project-driven environment.
    - Describe how your integration into the team involved specific professional tasks (e.g., for Law: "participating in client consultations"; for Engineering: "joining site inspections").

    **"### 3.2 Tools and Methodologies Used":**
    - This section should also be a long and detailed paragraph.
    - Detail your proficiency with modern tools and industry-standard methodologies, including **{{{technologiesUsed}}}**.
    - Specifically, explain the use of **'{{{programmingLanguage}}}'** as a core standard/software and the **'{{{framework}}}'** methodology/tool. Provide detailed explanations of these concepts and their practical application.
    - Mention any ancillary tools used for project management or collaboration.

    {{/if}}

    Return the final result as a single JSON object with a 'skillsChapterText' key. The value should be a single string containing the full, extremely detailed chapter content.
    `,
});

const generateSkillsChapterFlow = ai.defineFlow(
  {
    name: 'generateSkillsChapterFlow',
    inputSchema: GenerateSkillsChapterInputSchema,
    outputSchema: GenerateSkillsChapterFlowOutputSchema,
  },
  async input => {
    const response = await skillsChapterPrompt(input);
    const {output} = response;

    if (!output) {
      throw new Error(
        'Failed to generate skills chapter. The AI returned empty content.'
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

export async function generateSkillsChapter(
  input: GenerateSkillsChapterInput
): Promise<GenerateSkillsChapterResult> {
  return generateSkillsChapterFlow(input);
}
