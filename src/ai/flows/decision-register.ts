'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { DecisionRegister } from '@/lib/generator/contracts/types';

const DecisionJobInputSchema = z.object({
  topic: z.string(),
  suppliedFacts: z.string(),
  existingRegister: z.string(),
});

const DecisionJobOutputSchema = z.object({
  topic: z.string().nullable(),
  objectives: z.array(z.string()),
  researchQuestions: z.array(z.string()),
  design: z.string().nullable(),
  theory: z.object({
    name: z.string(),
    rationale: z.string(),
    topicFit: z.string(),
  }).nullable(),
  population: z.string().nullable(),
  sampling: z.string().nullable(),
  instruments: z.array(z.string()),
  analysisMethod: z.string().nullable(),
  keyTerms: z.array(z.object({ term: z.string(), definition: z.string() })),
  contextFacts: z.record(z.string(), z.string()),
});

const decisionPrompt = ai.definePrompt({
  name: 'contractGatedDecisionRegisterPrompt',
  input: { schema: DecisionJobInputSchema },
  output: { schema: DecisionJobOutputSchema },
  prompt: `Resolve the structured research decisions needed before writing any prose.
Topic: {{topic}}
Facts supplied by the document owner: {{suppliedFacts}}
Existing register (preserve any explicit owner decision): {{existingRegister}}

Return only structured fields. Do not write document prose. Do not invent facts about a population, sample size, instruments, data, or results. Leave an unknown field null or empty. Where the topic requires a research framework, select one directly relevant to the topic and explain its fit in theory.topicFit. Do not use a generic technology adoption theory unless the topic concerns technology adoption.`,
});

export async function generateDecisionRegister(
  topic: string,
  suppliedFacts: string,
  existingRegister: DecisionRegister,
): Promise<DecisionRegister> {
  const response = await decisionPrompt({
    topic,
    suppliedFacts,
    existingRegister: JSON.stringify(existingRegister),
  });
  if (!response.output) throw new Error('The decision job returned no register.');
  return response.output;
}

const TheoryFitInputSchema = z.object({
  topic: z.string(),
  theory: z.string(),
  rationale: z.string(),
});
const TheoryFitOutputSchema = z.object({
  fits: z.boolean(),
  explanation: z.string(),
});
const theoryFitPrompt = ai.definePrompt({
  name: 'contractGatedTheoryFitPrompt',
  input: { schema: TheoryFitInputSchema },
  output: { schema: TheoryFitOutputSchema },
  prompt: `Determine whether the named theory is substantively relevant to the research topic, not merely a familiar framework.
Topic: {{topic}}
Theory: {{theory}}
Proposed rationale: {{rationale}}
Return fits=false for a framework whose concepts, assumptions, or explanatory scope do not apply to the topic. Return only the structured result.`,
});

export async function validateTheoryFit(topic: string, theory: DecisionRegister['theory']) {
  if (!theory) return { fits: false, explanation: 'A theory is required for this document.' };
  const response = await theoryFitPrompt({ topic, theory: theory.name, rationale: theory.rationale });
  if (!response.output) throw new Error('The theory-fit check returned no result.');
  return response.output;
}
