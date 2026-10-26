import { z } from 'zod';
import { BlockType } from '../renderer/types';
import { MoveOutput } from '../contracts/types';

const BlockSchema = z.object({
  type: z.enum(['paragraph', 'definition_list', 'enumerated_list'] satisfies [BlockType, ...BlockType[]]),
  text: z.string().trim().min(1),
  source_ids: z.array(z.string()),
});

export const MoveOutputSchema = z.object({
  slot_id: z.string().min(1),
  move_id: z.string().min(1),
  blocks: z.array(BlockSchema).min(1),
  source_ids: z.array(z.string()),
  complete: z.literal(true),
}).strict();

export function parseMoveOutput(value: unknown): { success: true; data: MoveOutput } | { success: false; reasons: string[] } {
  const result = MoveOutputSchema.safeParse(value);
  if (!result.success) {
    return {
      success: false,
      reasons: result.error.issues.map((issue) => `${issue.path.join('.') || 'output'}: ${issue.message}`),
    };
  }

  return {
    success: true,
    data: {
      slot_id: result.data.slot_id,
      move_id: result.data.move_id,
      blocks: result.data.blocks.map((block) => ({
        type: block.type,
        text: block.text,
        sourceIds: block.source_ids,
      })),
      source_ids: result.data.source_ids,
      complete: result.data.complete,
    },
  };
}
