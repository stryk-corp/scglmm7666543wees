'use server';

/**
 * @fileOverview AI-powered generation of Mermaid.js diagrams from text.
 *
 * This file defines a Genkit flow to convert a textual description of a hierarchy
 * (like an organogram) into Mermaid.js syntax.
 *
 * - generateDiagram - An async function that orchestrates the generation of the diagram syntax.
 * - GenerateDiagramInput - The input type for the generateDiagram function.
 * - GenerateDiagramOutput - The output type for the generateDiagram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramInputSchema = z.object({
  description: z
    .string()
    .describe(
      'A textual description of the hierarchy, typically a list of abbreviations and their meanings (e.g., "CEO - Chief Executive Officer").'
    ),
});

export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  mermaidSyntax: z.string().describe('The generated diagram in Mermaid.js flowchart syntax.'),
});

export type GenerateDiagramOutput = z.infer<
  typeof GenerateDiagramOutputSchema
>;

const diagramPrompt = ai.definePrompt({
  name: 'diagramPrompt',
  input: {schema: GenerateDiagramInputSchema},
  output: {schema: GenerateDiagramOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert in creating organizational charts using Mermaid.js syntax. Based on the provided list of roles, create a Mermaid flowchart that represents a standard corporate hierarchy.

    **Critical Instructions:**
    1.  The output must be ONLY the Mermaid syntax, starting with 'graph TD'.
    2.  Use the abbreviations (e.g., 'CEO', 'CTO') as the node IDs and the full titles as the node text. Example: \`CEO("Chief Executive Officer")\`.
    3.  Infer a logical hierarchy from the roles provided. A typical structure is CEO at the top, followed by C-level executives (CFO, CTO, COO), then managers (PM), and then other roles.
    4.  Connect the nodes logically using '-->'.
    5.  Do not include any explanations, backticks, or any other text outside of the Mermaid syntax.
    6.  If a role like 'PA' (Personal Assistant) is present, it should be a diamond shape and positioned between the CEO and the next level of management. Example: \`PA{Personal Assistant}\`.
    7.  The graph direction must be Top-Down ('graph TD').

    **Example Input:**
    "CEO - Chief Executive Officer, PA - Personal Assistant, CTO - Chief Technology Officer, CFO - Chief Financial Officer, PM - Project Manager"

    **Example Output for the above input:**
    graph TD
        CEO("Chief Executive Officer") --> PA{Personal Assistant}
        PA --> CFO("Chief Financial Officer")
        PA --> CTO("Chief Technology Officer")
        CTO --> PM("Project Manager")

    **User's Role Descriptions:**
    {{{description}}}
    `,
});

const generateDiagramFlow = ai.defineFlow(
  {
    name: 'generateDiagramFlow',
    inputSchema: GenerateDiagramInputSchema,
    outputSchema: GenerateDiagramOutputSchema,
  },
  async input => {
    const {output} = await diagramPrompt(input);
    if (!output) {
      throw new Error('Failed to generate diagram. The AI returned empty content.');
    }
    return output;
  }
);

export async function generateDiagram(
  input: GenerateDiagramInput
): Promise<GenerateDiagramOutput> {
  return generateDiagramFlow(input);
}
