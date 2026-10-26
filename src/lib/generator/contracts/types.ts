import { BlockType } from '../renderer/types';
import { DocumentType, SectionRole } from '../grammar/types';

export type DecisionField =
  | 'topic'
  | 'objectives'
  | 'researchQuestions'
  | 'design'
  | 'theory'
  | 'population'
  | 'sampling'
  | 'instruments'
  | 'analysisMethod'
  | 'keyTerms'
  | 'contextFacts';

export interface DecisionRegister {
  topic: string | null;
  objectives: string[];
  researchQuestions: string[];
  design: string | null;
  theory: { name: string; rationale: string; topicFit: string } | null;
  population: string | null;
  sampling: string | null;
  instruments: string[];
  analysisMethod: string | null;
  keyTerms: Array<{ term: string; definition: string }>;
  contextFacts: Record<string, string>;
}

export interface Source {
  sourceId: string;
  authors: string[];
  year: number | null;
  title: string;
  finding: string;
  relevance: string;
  doiOrUrl?: string;
}

export interface Move {
  id: string;
  instruction: string;
  maxWords: number;
}

export interface SlotContract {
  slotId: string;
  role: SectionRole;
  reads: DecisionField[];
  moves: Move[];
  mustNotContain: string[];
  blockTypes: BlockType[];
  minWords: number;
  targetWords: number;
  maxWords: number;
  requiresSources: boolean;
}

export interface ApprovedBlock {
  type: BlockType;
  text: string;
  sourceIds: string[];
}

export interface MoveOutput {
  slot_id: string;
  move_id: string;
  blocks: ApprovedBlock[];
  source_ids: string[];
  complete: true;
}

export type MoveStatus =
  | 'pending'
  | 'generating'
  | 'validating'
  | 'complete'
  | 'needs_repair'
  | 'failed'
  | 'flagged'
  | 'blocked_needs_sources';

export interface GenerationJob {
  id: string;
  documentId: string;
  slotId: string;
  moveId: string;
  status: MoveStatus;
  attempts: number;
  maxRetries: 3;
  failureReasons: string[];
  blocks: ApprovedBlock[];
  updatedAt: string;
}

export interface SlotState {
  slotId: string;
  role: SectionRole;
  status: MoveStatus;
  jobs: Record<string, MoveStatus>;
  updatedAt: string;
}

export interface GenerationDocument {
  id: string;
  ownerId: string;
  title: string;
  documentType: DocumentType;
  grammarVersion: string;
  status: 'configuring' | 'generating' | 'blocked' | 'needs_review' | 'complete';
  decisions: DecisionRegister;
  sources: Source[];
  slotContracts: Record<string, SlotContract>;
  slotStates: Record<string, SlotState>;
  totalWordBudget: number;
  createdAt: string;
  updatedAt: string;
}

export type ValidationGate =
  | 'schema'
  | 'hostile_text'
  | 'role_fit'
  | 'boundary'
  | 'word_count'
  | 'evidence'
  | 'consistency';

export interface GateResult {
  gate: ValidationGate;
  passed: boolean;
  reasons: string[];
}

export interface ValidationResult {
  passed: boolean;
  gates: GateResult[];
}

export function emptyDecisionRegister(): DecisionRegister {
  return {
    topic: null,
    objectives: [],
    researchQuestions: [],
    design: null,
    theory: null,
    population: null,
    sampling: null,
    instruments: [],
    analysisMethod: null,
    keyTerms: [],
    contextFacts: {},
  };
}
