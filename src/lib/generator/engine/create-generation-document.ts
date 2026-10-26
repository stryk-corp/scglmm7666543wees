import { randomUUID } from 'crypto';
import { GenerationDocument, DecisionRegister, Source, SlotState } from '../contracts/types';
import { getGrammar } from '../grammar/registry';
import { validateGrammarTree } from '../grammar/integrity';
import { createSlotContracts } from '../contracts/slot-contracts';
import { createGenerationJob } from './generation-state';

export interface CreateGenerationDocumentInput {
  ownerId: string;
  title: string;
  documentType: GenerationDocument['documentType'];
  decisions: DecisionRegister;
  sources?: Source[];
  targetPages: number;
}

export function createGenerationDocument(input: CreateGenerationDocumentInput): GenerationDocument {
  const grammar = getGrammar(input.documentType);
  const violations = validateGrammarTree(grammar);
  if (violations.length > 0) {
    throw new Error(`Invalid ${grammar.documentType} grammar: ${violations.map((item) => item.message).join(' ')}`);
  }
  if (!input.ownerId.trim() || !input.title.trim()) throw new Error('Document owner and title are required.');
  if (!Number.isInteger(input.targetPages) || input.targetPages < 1) throw new Error('A positive whole-number page target is required.');

  const id = randomUUID();
  const slotContracts = createSlotContracts(grammar, input.targetPages);
  const slotStates: Record<string, SlotState> = {};
  for (const contract of Object.values(slotContracts)) {
    const jobs = Object.fromEntries(contract.moves.map((move) => [
      move.id,
      createGenerationJob(id, contract.slotId, move.id).status,
    ]));
    slotStates[contract.slotId] = {
      slotId: contract.slotId,
      role: contract.role,
      status: 'pending',
      jobs,
      updatedAt: new Date().toISOString(),
    };
  }

  const now = new Date().toISOString();
  return {
    id,
    ownerId: input.ownerId,
    title: input.title,
    documentType: grammar.documentType,
    grammarVersion: '1.0.0',
    status: 'configuring',
    decisions: input.decisions,
    sources: input.sources ?? [],
    slotContracts,
    slotStates,
    totalWordBudget: Object.values(slotContracts).reduce((sum, contract) => sum + contract.targetWords, 0),
    createdAt: now,
    updatedAt: now,
  };
}
