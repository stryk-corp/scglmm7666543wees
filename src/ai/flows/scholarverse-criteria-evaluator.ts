'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CriteriaEvaluatorInputSchema = z.object({
  sectionHeading: z.string(),
  sectionPurpose: z.string(),
  contentMarkdown: z.string(),
  citationStyle: z.string().default('APA_7'),
  documentType: z.enum(['research_project', 'essay', 'term_paper', 'siwes_report']).default('term_paper'),
});

export type CriteriaEvaluatorInput = z.infer<typeof CriteriaEvaluatorInputSchema>;

const CriteriaFlagSchema = z.object({
  type: z.enum(['missing_citation', 'unsubstantiated_claim', 'repetition', 'formatting', 'shallow_analysis']),
  description: z.string().describe('Clear explanation of what was deficient.'),
  suggestedFix: z.string().describe('Specific, actionable instruction on how to correct it.'),
});

const CriteriaEvaluatorOutputSchema = z.object({
  academicDepth: z.number().min(0).max(100).describe('Score for intellectual rigor and critical depth.'),
  evidenceCoverage: z.number().min(0).max(100).describe('Score for evidentiary support, examples, or citations.'),
  coherence: z.number().min(0).max(100).describe('Score for logical progression and paragraph transitions.'),
  passedCriteria: z.boolean().describe('True if overall quality meets academic publishing threshold (scores >= 70 and no fatal flaws).'),
  critiqueSummary: z.string().describe('Short 2-3 sentence overview of the section quality and key strengths or weaknesses.'),
  flags: z.array(CriteriaFlagSchema).describe('List of specific issues flagged for targeted remediation.'),
});

export type CriteriaEvaluatorOutput = z.infer<typeof CriteriaEvaluatorOutputSchema>;

const criteriaEvaluatorPrompt = ai.definePrompt({
  name: 'scholarverseCriteriaEvaluatorPrompt',
  input: { schema: CriteriaEvaluatorInputSchema },
  output: { schema: CriteriaEvaluatorOutputSchema },
  prompt: `You are an academic auditor and review referee for Scholarverse.
Your task is to critically evaluate a submitted draft section against strict academic criteria.

### SECTION TARGET
- Heading: {{sectionHeading}}
- Defined Purpose: {{sectionPurpose}}
- Document Type: {{documentType}}
- Required Citation Standard: {{citationStyle}}

### SUBMITTED PROSE
"""
{{contentMarkdown}}
"""

### EVALUATION CRITERIA
1. **Academic Depth (0-100)**: Does the text thoroughly deconstruct the topic, or is it merely skimming the surface with generic buzzwords?
2. **Evidence Coverage (0-100)**:
   - For Essays & Term Papers: Are assertions substantiated with appropriate in-text citations in {{citationStyle}}?
   - For SIWES Reports: Does it cite concrete procedures, technical tools, protocols, or equipment rather than vague statements?
3. **Coherence & Structure (0-100)**: Do ideas follow a clear logical narrative with smooth paragraph transitions?
4. **Redundancy & Repetition**: Are words or concepts unproductively repeated?

Evaluate strictly and return the scores, summary, and concrete actionable flags.`,
});

export const evaluateSectionCriteria = ai.defineFlow(
  {
    name: 'evaluateSectionCriteriaFlow',
    inputSchema: CriteriaEvaluatorInputSchema,
    outputSchema: CriteriaEvaluatorOutputSchema,
  },
  async (input) => {
    const response = await criteriaEvaluatorPrompt(input);
    const output = response.output;
    if (!output) {
      throw new Error('Failed to evaluate section criteria');
    }
    return output;
  }
);
