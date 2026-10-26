'use server';

/**
 * @fileOverview AI-powered suggestions for SIWES report fields.
 *
 * This file defines a Genkit flow that provides suggestions for a single field
 * at a time based on the user's input for other fields.
 *
 * - provideAISuggestions - A function that calls the AI suggestion flow.
 * - ProvideAISuggestionsInput - The input type for the provideAISuggestions function.
 * - ProvideAISuggestionsOutput - The output type for the provideAISuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { SuggestibleFieldsSchema } from '@/lib/schema/suggestions';


const ProvideAISuggestionsInputSchema = z.object({
  fieldToSuggest: SuggestibleFieldsSchema.describe('The specific field for which to generate a suggestion.'),
  existingData: z.object({
    fullName: z.string().optional().describe("The student's full name."),
    universityName: z.string().optional().describe("The name of the university."),
    facultyName: z.string().optional().describe("The name of the faculty."),
    departmentName: z.string().optional().describe('The name of the department.'),
    courseCode: z.string().optional().describe("The course code for the SIWES report."),
    placeOfAttachment: z.string().optional().describe("The name of the company."),
    fieldOfStudy: z.string().optional().describe('The field of study.'),
    primarySkill: z.string().optional().describe('The primary skill area.'),
    projectsDescription: z.string().optional().describe('A manual description of the projects worked on.'),
    reportTitle: z.string().optional().describe('The document title or term paper topic.'),
  }).describe('The existing data from the form to use as context.'),
});
export type ProvideAISuggestionsInput = z.infer<typeof ProvideAISuggestionsInputSchema>;

const ProvideAISuggestionsOutputSchema = z.object({
  suggestion: z.string().optional().describe("The generated suggestion for the requested field."),
});
export type ProvideAISuggestionsOutput = z.infer<typeof ProvideAISuggestionsOutputSchema>;

export async function provideAISuggestions(input: ProvideAISuggestionsInput): Promise<ProvideAISuggestionsOutput> {
  return provideAISuggestionsFlow(input);
}

const provideAISuggestionsPrompt = ai.definePrompt({
  name: 'provideAISuggestionsPrompt',
  input: {schema: ProvideAISuggestionsInputSchema},
  output: {schema: ProvideAISuggestionsOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert technical writer and academic assistant. Based on the user's partial SIWES report data, provide a detailed and professional suggestion for ONLY the field specified in 'fieldToSuggest'.
  
  **Field to generate suggestion for: {{{fieldToSuggest}}}**

  Here is the student's existing data for context:
  - University: {{{existingData.universityName}}}
  - Department: {{{existingData.departmentName}}}
  - Place of Attachment: {{{existingData.placeOfAttachment}}}
  - Field of Study: {{{existingData.fieldOfStudy}}}
  - Primary Skill: {{{existingData.primarySkill}}}
  - Manual Projects Description: "{{{existingData.projectsDescription}}}"

  **Special Instructions:**
  - If 'fieldToSuggest' is 'organogramAbbreviations', provide this exact, detailed example: "CEO - Chief Executive Officer, PA - Personal Assistant, CFO - Chief Financial Officer, CTO - Chief Technology Officer, COO - Chief Operating Officer, PM - Project Manager, AST. PM - Assistant Project Manager"
  - For all other fields, generate a concise and relevant suggestion.

  Return the suggestion in JSON format with a single "suggestion" key.
  `,
});

const provideAISuggestionsFlow = ai.defineFlow(
  {
    name: 'provideAISuggestionsFlow',
    inputSchema: ProvideAISuggestionsInputSchema,
    outputSchema: ProvideAISuggestionsOutputSchema,
  },
  async input => {
    const {output} = await provideAISuggestionsPrompt(input);
    return output!;
  }
);
