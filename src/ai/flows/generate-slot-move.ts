'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SlotContract, Source, DecisionRegister, Move } from '@/lib/generator/contracts/types';

const MoveResultSchema = z.object({
  slot_id: z.string(),
  move_id: z.string(),
  blocks: z.array(z.object({
    type: z.enum(['paragraph', 'definition_list', 'enumerated_list']),
    text: z.string(),
    source_ids: z.array(z.string()),
  })),
  source_ids: z.array(z.string()),
  complete: z.literal(true),
});

const MoveInputSchema = z.object({
  slotId: z.string(),
  role: z.string(),
  move: z.object({ id: z.string(), instruction: z.string(), maxWords: z.number() }),
  contract: z.string(),
  decisions: z.string(),
  sources: z.string(),
  completedSectionSummaries: z.array(z.string()),
  repairReasons: z.array(z.string()),
});

export type GenerateSlotMoveInput = {
  slotId: string;
  contract: SlotContract;
  move: Move;
  decisions: DecisionRegister;
  sources: Source[];
  completedSectionSummaries: string[];
  repairReasons: string[];
};

const movePrompt = ai.definePrompt({
  name: 'contractGatedSlotMovePrompt',
  input: { schema: MoveInputSchema },
  output: { schema: MoveResultSchema },
  prompt: `Fill exactly one active prose move in a locked academic document grammar.
Return only the requested JSON object. Do not write headings, section numbers, Markdown, formatting, user instructions, or any other move or section.

Active slot: {{slotId}}
Active role: {{role}}
Active move: {{move.id}}
Move instruction: {{move.instruction}}
Maximum words for this move: {{move.maxWords}}
Slot contract: {{contract}}
Relevant Decision Register fields: {{decisions}}
Verified Source Pool entries: {{sources}}
Summaries of completed sections: {{#each completedSectionSummaries}}{{this}}{{/each}}
Repair reasons from prior validation: {{#each repairReasons}}{{this}}{{/each}}

Return JSON with slot_id and move_id exactly matching the active IDs; blocks must contain only paragraph, definition_list, or enumerated_list text. Cite evidence using source_ids on each block and the top-level source_ids array. Never invent or cite a source not supplied above. If source evidence is required but none is supplied, do not produce prose.
Set complete to true only for this move.`,
});

export async function generateSlotMove(input: GenerateSlotMoveInput) {
  const response = await movePrompt({
    slotId: input.slotId,
    role: input.contract.role,
    move: input.move,
    contract: JSON.stringify(input.contract),
    decisions: JSON.stringify(input.decisions),
    sources: JSON.stringify(input.sources),
    completedSectionSummaries: input.completedSectionSummaries,
    repairReasons: input.repairReasons,
  });
  if (!response.output) throw new Error(`The model returned no output for move "${input.move.id}".`);
  return response.output;
}
