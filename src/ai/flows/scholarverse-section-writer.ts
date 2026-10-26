'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SectionWriterInputSchema = z.object({
  documentType: z.enum(['research_project', 'essay', 'term_paper', 'siwes_report']),
  academicLevel: z.enum(['secondary', 'undergraduate', 'postgraduate']),
  discipline: z.string(),
  institutionName: z.string().optional(),
  citationStyle: z.string(),
  projectTitle: z.string(),
  sectionHeading: z.string(),
  hierarchicalPath: z.string(),
  sectionPurpose: z.string(),
  keyQuestions: z.array(z.string()).optional(),
  projectMemorySummary: z.string(),
  targetWordCount: z.number().default(400),
  actionInstruction: z.enum([
    'initial_draft',
    'expand',
    'simplify',
    'add_practical_example',
    'academic_tone',
    'shorten'
  ]).default('initial_draft'),
  currentDraft: z.string().optional(),
});

export type SectionWriterInput = z.infer<typeof SectionWriterInputSchema>;

const SectionWriterOutputSchema = z.object({
  contentMarkdown: z.string().describe('The synthesized academic prose in markdown format, with proper sub-headings if appropriate and in-text citations.'),
  wordCount: z.number().describe('Estimated total word count of the generated section.'),
  keyTakeaway: z.string().describe('A single-sentence synopsis of what this section established.'),
});

export type SectionWriterOutput = z.infer<typeof SectionWriterOutputSchema>;

const sectionWriterPrompt = ai.definePrompt({
  name: 'scholarverseSectionWriterPrompt',
  input: { schema: SectionWriterInputSchema },
  output: { schema: SectionWriterOutputSchema },
  prompt: `You are an expert academic co-author and scholarly researcher for Scholarverse.
Your objective is to generate rigorous, authentic, and scholarly prose for a single section of an academic document.

### DOCUMENT SPECIFICATION
- Document Type: {{documentType}}
- Academic Level: {{academicLevel}}
- Discipline / Department: {{discipline}}
- Institution: {{institutionName}}
- Referencing Style: {{citationStyle}}
- Overall Document Title: {{projectTitle}}

### ACTIVE SECTION
- Hierarchy: {{hierarchicalPath}}
- Heading: {{sectionHeading}}
- Defined Purpose: {{sectionPurpose}}
{{#if keyQuestions}}
- Key Questions It Must Answer:
{{#each keyQuestions}}
  * {{this}}
{{/each}}
{{/if}}
- Target Word Count: approximately {{targetWordCount}} words.

### GLOBAL PROJECT CONTEXT & VERIFIED FACTS
{{projectMemorySummary}}

### GENERATION MODE & INSTRUCTION
{{#if currentDraft}}
CURRENT DRAFT:
"""
{{currentDraft}}
"""

ACTION REQUESTED: {{actionInstruction}}
{{#if (eq actionInstruction "expand")}}
Expand this section with greater analytical depth, theoretical rigor, and detailed explanations while preserving existing facts.
{{/if}}
{{#if (eq actionInstruction "simplify")}}
Clarify and elucidate complex points without diluting academic validity.
{{/if}}
{{#if (eq actionInstruction "add_practical_example")}}
Inject a concrete, authentic technical or practical industrial example illustrating the claim.
{{/if}}
{{#if (eq actionInstruction "academic_tone")}}
Elevate the vocabulary, remove colloquialisms, and ensure impeccable objective academic register.
{{/if}}
{{#if (eq actionInstruction "shorten")}}
Make the prose more concise, eliminating redundancy while retaining every key argument.
{{/if}}
{{else}}
Produce the complete, comprehensive initial draft for this section.
{{/if}}

### WRITING RULES & ACCEPTANCE STANDARDS
1. **Never Invent False Facts**: For SIWES reports, adhere strictly to the student's company, department, tools, and tasks supplied in project memory. Do not invent unrelated internship history.
2. **Citations**: For Essays and Term Papers, incorporate realistic in-text citations matching {{citationStyle}} (e.g. (Author, Year) or [1]).
3. **No Fluff or Filler**: Every paragraph must advance the specific section purpose. Use topic sentences, supporting empirical or theoretical evidence, and clear analytical transitions.
4. **Formatting**: Output clear Markdown with paragraphs separated by double line breaks.

Generate the section now.`,
});

export const writeDocumentSection = ai.defineFlow(
  {
    name: 'writeDocumentSectionFlow',
    inputSchema: SectionWriterInputSchema,
    outputSchema: SectionWriterOutputSchema,
  },
  async (input) => {
    const response = await sectionWriterPrompt(input);
    const output = response.output;
    if (!output) {
      throw new Error('Failed to generate section content');
    }
    const calculatedWords = output.contentMarkdown.trim().split(/\s+/).filter(Boolean).length;
    return {
      ...output,
      wordCount: calculatedWords,
    };
  }
);
