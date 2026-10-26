import {
  DecisionRegister,
  MoveOutput,
  SlotContract,
  Source,
  ValidationGate,
  ValidationResult,
} from '../contracts/types';

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateHostileText(text: string, headings: string[] = []): string[] {
  const reasons: string[] = [];
  if (/[#`]/.test(text) || /\*\*|__/.test(text)) reasons.push('Markdown syntax is not allowed.');
  if (/^\s*\d+(?:\.\d+)*[.)]?\s+\S/m.test(text)) reasons.push('Numbered headings or list labels are not allowed in prose blocks.');
  if (/^\s*(?:#{1,6}\s*)?[A-Z][^\n.!?]{1,90}\s*$/m.test(text)) reasons.push('Standalone heading-like lines are not allowed.');
  if (/\bcan be specified\b|\bStep\s+\d+\b|\bTBD\b|\bto be determined\b|\[insert\b|\[placeholder\b/i.test(text)) {
    reasons.push('Template or placeholder text is not allowed.');
  }
  if (/\be\.g\.\s*(?:\[|<|\.\.\.|insert|placeholder)|\bfor example\s*(?:\[|<|\.\.\.|insert|placeholder)/i.test(text)) {
    reasons.push('Unfilled example cues are not allowed.');
  }
  if (/\b(?:please|you should|your task is|insert here|fill in|write your)\b/i.test(text)) {
    reasons.push('Instructions addressed to the user are not allowed.');
  }
  const normalizedHeadings = new Set(headings.map((heading) => heading.trim().toLowerCase()));
  if (text.split(/\r?\n/).some((line) => normalizedHeadings.has(line.trim().toLowerCase()))) {
    reasons.push('Grammar headings must not appear inside generated prose.');
  }
  return reasons;
}

export function validateBoundary(text: string, contract: SlotContract): string[] {
  const lower = text.toLowerCase();
  return contract.mustNotContain
    .filter((phrase) => lower.includes(phrase.toLowerCase()))
    .map((phrase) => `Contains forbidden boundary content: "${phrase}".`);
}

export function validateWordCount(
  output: MoveOutput,
  contract: SlotContract,
  moveId: string,
  previousBlocks: Array<{ text: string }>,
  isLastMove: boolean,
): string[] {
  const reasons: string[] = [];
  const move = contract.moves.find((candidate) => candidate.id === moveId);
  if (!move) return [`Move "${moveId}" is not part of slot "${contract.slotId}".`];

  const currentWords = output.blocks.reduce((sum, block) => sum + wordCount(block.text), 0);
  const priorWords = previousBlocks.reduce((sum, block) => sum + wordCount(block.text), 0);
  if (currentWords > move.maxWords) reasons.push(`Move has ${currentWords} words; maximum is ${move.maxWords}.`);
  if (priorWords + currentWords > contract.maxWords) {
    reasons.push(`Slot would have ${priorWords + currentWords} words; maximum is ${contract.maxWords}.`);
  }
  if (isLastMove && priorWords + currentWords < contract.minWords) {
    reasons.push(`Completed slot has ${priorWords + currentWords} words; minimum is ${contract.minWords}.`);
  }
  return reasons;
}

export function validateEvidence(output: MoveOutput, sources: Source[]): string[] {
  const reasons: string[] = [];
  const validSourceIds = new Set(sources.map((source) => source.sourceId));
  const blockSourceIds = output.blocks.flatMap((block) => block.sourceIds);
  const uniqueBlockSourceIds = [...new Set(blockSourceIds)];
  const listedIds = new Set(output.source_ids);

  if (sources.length === 0) reasons.push('No verified source records are available.');
  output.blocks.forEach((block, index) => {
    if (block.sourceIds.length === 0) reasons.push(`Evidence block ${index + 1} does not cite a source_id.`);
    block.sourceIds.forEach((sourceId) => {
      if (!validSourceIds.has(sourceId)) reasons.push(`Unknown source_id "${sourceId}".`);
    });
  });
  uniqueBlockSourceIds.forEach((sourceId) => {
    if (!listedIds.has(sourceId)) reasons.push(`Top-level source_ids omits "${sourceId}".`);
  });
  output.source_ids.forEach((sourceId) => {
    if (!validSourceIds.has(sourceId)) reasons.push(`Unknown source_id "${sourceId}".`);
  });
  return [...new Set(reasons)];
}

const THEORY_PATTERNS = [
  'technology acceptance model',
  'diffusion of innovations',
  'theory of planned behavior',
  'unified theory of acceptance and use of technology',
  'resource-based view',
  'agency theory',
  'institutional theory',
];

export function validateConsistency(
  output: MoveOutput,
  contract: SlotContract,
  decisions: DecisionRegister,
): string[] {
  const reasons: string[] = [];
  const text = output.blocks.map((block) => block.text).join(' ').toLowerCase();

  if (contract.reads.includes('theory') && decisions.theory) {
    const otherTheories = THEORY_PATTERNS.filter((theory) =>
      text.includes(theory) && theory !== decisions.theory?.name.toLowerCase(),
    );
    if (otherTheories.length > 0) {
      reasons.push(`Text introduces theory/framework not in the Decision Register: ${otherTheories.join(', ')}.`);
    }
  }

  if (contract.reads.includes('design') && decisions.design) {
    const designTokens = decisions.design.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 4);
    const mismatchedQuant = /\b(?:qualitative|quantitative|mixed[- ]methods?)\b/gi;
    const mentionedDesigns = [...text.matchAll(mismatchedQuant)].map((match) => match[0].toLowerCase());
    if (mentionedDesigns.length > 0 && !mentionedDesigns.some((design) => designTokens.some((token) => design.includes(token)))) {
      reasons.push(`Text describes a design inconsistent with the registered design "${decisions.design}".`);
    }
  }
  return reasons;
}

export interface MoveGateInput {
  output: MoveOutput;
  contract: SlotContract;
  moveId: string;
  priorBlocks: Array<{ text: string }>;
  isLastMove: boolean;
  sources: Source[];
  decisions: DecisionRegister;
  expectedRole: string;
  classifiedRole: string;
  grammarHeadings: string[];
}

export function validateMove(input: MoveGateInput): ValidationResult {
  const gates: ValidationResult['gates'] = [];
  const add = (gate: ValidationGate, reasons: string[]) => gates.push({ gate, passed: reasons.length === 0, reasons });

  add('schema', input.output.slot_id === input.contract.slotId && input.output.move_id === input.moveId
    ? []
    : ['Output slot_id or move_id does not match the active move.']);
  add('hostile_text', input.output.blocks.flatMap((block) => validateHostileText(block.text, input.grammarHeadings)));
  add('role_fit', input.classifiedRole === input.expectedRole
    ? []
    : [`Classifier returned role "${input.classifiedRole}", expected "${input.expectedRole}".`]);
  add('boundary', input.output.blocks.flatMap((block) => validateBoundary(block.text, input.contract)));
  add('word_count', validateWordCount(input.output, input.contract, input.moveId, input.priorBlocks, input.isLastMove));
  add('evidence', input.contract.requiresSources ? validateEvidence(input.output, input.sources) : []);
  add('consistency', validateConsistency(input.output, input.contract, input.decisions));

  return { passed: gates.every((gate) => gate.passed), gates };
}
