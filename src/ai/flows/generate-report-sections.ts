'use server';

/**
 * @fileOverview AI-powered generation of SIWES report sections.
 *
 * This file defines Genkit flows and prompts to generate the Acknowledgment and Abstract sections of a SIWES report.
 *
 * @module src/ai/flows/generate-report-sections
 *
 * @exports generateReportSections - An async function that orchestrates the generation of report sections.
 * @exports GenerateReportSectionsInput - The input type for the generateReportSections function.
 * @exports GenerateReportSectionsOutput - The output type for the generateReportSections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {GenerationTokenUsageSchema} from './generation-usage';

const GenerateReportSectionsInputSchema = z.object({
  reportTitle: z.string().optional().describe('The report topic or title.'),
  fullName: z.string().describe("The student's full name."),
  universityName: z.string().describe("The name of the university."),
  departmentName: z.string().describe('The name of the department.'),
  facultyName: z.string().describe("The name of the faculty."),
  placeOfAttachment: z.string().describe('The name of the place of attachment.'),
  supervisorNames: z.string().describe('Comma-separated names of supervisors.'),
  fieldOfStudy: z.string().describe('The field of study (e.g., Law, Engineering, Medicine).'),
  attachmentLocation: z.string().describe('The location of the attachment.'),
  primarySkill: z.string().describe('The primary skill or competency acquired during the attachment.'),
  framework: z.string().describe('A specialized tool, methodology, or framework used.'),
  programmingLanguage: z.string().describe('A key software, standard, or primary tool used.'),
  careerPath: z.string().describe('The desired career path.'),
  ceoName: z.string().optional().describe("The name of the company's CEO."),
  isHumanized: z.boolean().optional().default(true).describe('If true, the output should sound more natural and less robotic.'),
  targetWordCount: z.number().optional().describe('Target word count budget for page limit management.'),
  documentType: z.string().optional().describe('Document type: term_paper, essay, or siwes_report.'),
});

export type GenerateReportSectionsInput = z.infer<
  typeof GenerateReportSectionsInputSchema
>;

const GenerateReportSectionsOutputSchema = z.object({
  acknowledgementText: z.string().describe('The generated acknowledgement text.'),
  abstractText: z.string().describe('The generated abstract text.'),
});

export type GenerateReportSectionsOutput = z.infer<
  typeof GenerateReportSectionsOutputSchema
>;

const GenerateReportSectionsFlowOutputSchema =
  GenerateReportSectionsOutputSchema.extend({
    tokenUsage: GenerationTokenUsageSchema,
  });

export type GenerateReportSectionsResult = z.infer<
  typeof GenerateReportSectionsFlowOutputSchema
>;

const reportSectionsPrompt = ai.definePrompt({
  name: 'reportSectionsPrompt',
  input: {schema: GenerateReportSectionsInputSchema},
  output: {schema: GenerateReportSectionsOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert AI assistant for writing SIWES (Students Industrial Work Experience Scheme) reports for any academic discipline.
    Based on the data provided, generate both an Acknowledgment and an Abstract section.
    {{#if reportTitle}}
    The document topic is "{{{reportTitle}}}". Keep the abstract focused on this topic.
    {{/if}}

    {{#if isHumanized}}
    **Humanization Instruction:** The user has requested a "humanized" tone. Write these sections in a warm, sincere, yet professional voice. Avoid being overly generic. For the acknowledgement, make the gratitude sound genuine. For the abstract, write it as a confident summary of a personal experience.
    {{/if}}

    **Acknowledgement Instructions:**
    - The tone must be formal and grateful.
    - Thank the key people and institutions involved.
    - **Crucially, the final text must not exceed 300 words.**
    - Mention the following if provided:
      - The Company/Organization ({{{placeOfAttachment}}}) and its leader ({{{ceoName}}}).
      - Supervisors ({{{supervisorNames}}}).
      - Your University ({{{universityName}}}), Department ({{{departmentName}}}), and Faculty ({{{facultyName}}}).
      - Family and friends.
    - Conclude with your full name: {{{fullName}}}.
    
    **Abstract Instructions:**
    - Generate a concise and comprehensive summary of the industrial training, tailored to the student's **{{{fieldOfStudy}}}**.
    - **Crucially, the final text must not exceed {{#if targetWordCount}}{{targetWordCount}}{{else}}150{{/if}} words.**
    - It must briefly cover:
      1. **Introduction:** The purpose of the report in the context of the SIWES program at {{{placeOfAttachment}}}.
      2. **Body:** The specific skills acquired (e.g., {{{primarySkill}}}) and tools/methodologies used (e.g., {{{programmingLanguage}}}, {{{framework}}}). Briefly mention the work performed.
      3. **Conclusion:** The significance of the experience and its impact on your career goals in {{{careerPath}}}.

    Return the final result as a single JSON object with 'acknowledgementText' and 'abstractText' keys.
    `,
});

const generateReportSectionsFlow = ai.defineFlow(
  {
    name: 'generateReportSectionsFlow',
    inputSchema: GenerateReportSectionsInputSchema,
    outputSchema: GenerateReportSectionsFlowOutputSchema,
  },
  async input => {
    const response = await reportSectionsPrompt(input);
    const {output} = response;

    if (!output) {
      throw new Error(
        'Failed to generate report sections. The AI returned empty content.'
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

export async function generateReportSections(
  input: GenerateReportSectionsInput
): Promise<GenerateReportSectionsResult> {
  return generateReportSectionsFlow(input);
}
