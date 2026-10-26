import { classifySlotRole } from '@/ai/flows/classify-slot-role';
import { generateSlotMove } from '@/ai/flows/generate-slot-move';
import {
  DecisionField,
  GenerationDocument,
  GenerationJob,
  MoveOutput,
  SlotContract,
} from '../contracts/types';
import { getGrammar } from '../grammar/registry';
import { flattenNumberedSections, computeNumbering } from '../grammar/numbering';
import { containsGrammarNode } from '../grammar/integrity';
import { orderSlotsByDependency } from '../contracts/slot-contracts';
import { GenerationStore } from '../persistence/generation-store';
import { createGenerationJob, recordJobFailure, transitionJob } from './generation-state';
import { validateMove } from '../validation/gates';
import { parseMoveOutput } from '../validation/move-output';
import { auditDocument } from '../audit/global-audit';
import { ContentMap } from '../renderer/document-assembler';

export type MoveRunnerResult =
  | { status: 'move_complete'; slotId: string; moveId: string; blocks: MoveOutput['blocks'] }
  | { status: 'blocked_needs_sources'; slotId: string }
  | { status: 'blocked_missing_decisions'; slotId: string; fields: DecisionField[] }
  | { status: 'needs_repair'; slotId: string; moveId: string; reasons: string[] }
  | { status: 'flagged'; slotId: string; moveId: string; reasons: string[] }
  | { status: 'needs_review'; issues: Array<{ code: string; slotId?: string; message: string }> }
  | { status: 'document_complete' };

function missingDecisionFields(contract: SlotContract, document: GenerationDocument): DecisionField[] {
  return contract.reads.filter((field) => {
    const value = document.decisions[field];
    return Array.isArray(value) ? value.length === 0 : value === null || value === '';
  });
}

export async function runNextMove(
  store: GenerationStore,
  ownerId: string,
  documentId: string,
): Promise<MoveRunnerResult> {
  const document = await store.getDocument(ownerId, documentId);
  if (!document) throw new Error(`Generation document "${documentId}" does not exist.`);
  if (document.ownerId !== ownerId) throw new Error('The generation document is not owned by this user.');

  const grammar = getGrammar(document.documentType);
  const numbered = flattenNumberedSections(computeNumbering(grammar.sections));
  const grammarHeadings = numbered.map((section) => section.node.displayHeading);
  const slots = orderSlotsByDependency(grammar, document.slotContracts);

  for (const contract of slots) {
    if (!containsGrammarNode(grammar, contract.slotId)) {
      throw new Error(`Slot "${contract.slotId}" is not part of the locked grammar.`);
    }
    const slotState = document.slotStates[contract.slotId];
    if (!slotState) throw new Error(`Persisted slot state is missing for "${contract.slotId}".`);
    const requiredMoves = contract.moves;

    for (let index = 0; index < requiredMoves.length; index++) {
      const move = requiredMoves[index];
      const jobId = `${contract.slotId}__${move.id}`;
      let job = await store.getJob(ownerId, documentId, jobId);
      if (!job) {
        job = createGenerationJob(documentId, contract.slotId, move.id);
        slotState.jobs[move.id] = job.status;
      }
      if (job.status === 'complete') continue;
      if (job.status === 'flagged') {
        document.status = 'needs_review';
        await store.saveDocument(document);
        return { status: 'flagged', slotId: contract.slotId, moveId: move.id, reasons: job.failureReasons };
      }
      if (job.status === 'blocked_needs_sources' && document.sources.length === 0) {
        return { status: 'blocked_needs_sources', slotId: contract.slotId };
      }
      if (contract.requiresSources && document.sources.length === 0) {
        job = { ...job, status: 'blocked_needs_sources', updatedAt: new Date().toISOString() };
        slotState.jobs[move.id] = job.status;
        slotState.status = 'blocked_needs_sources';
        document.status = 'blocked';
        await store.saveJob(ownerId, documentId, job);
        await store.saveDocument(document);
        return { status: 'blocked_needs_sources', slotId: contract.slotId };
      }

      const missing = missingDecisionFields(contract, document);
      if (missing.length > 0) {
        document.status = 'blocked';
        await store.saveDocument(document);
        return { status: 'blocked_missing_decisions', slotId: contract.slotId, fields: missing };
      }

      if (job.status === 'generating' || job.status === 'validating') {
        job = {
          ...job,
          status: 'failed',
          failureReasons: ['Previous generation was interrupted; resuming this move.'],
          updatedAt: new Date().toISOString(),
        };
        slotState.jobs[move.id] = job.status;
        await store.saveJob(ownerId, documentId, job);
      }
      if (job.status === 'pending' || job.status === 'failed' || job.status === 'needs_repair') {
        job = transitionJob(job, 'generating');
      }
      job = { ...job, attempts: job.attempts + 1 };
      slotState.jobs[move.id] = job.status;
      slotState.status = 'generating';
      document.status = 'generating';
      await store.saveJob(ownerId, documentId, job);
      await store.saveDocument(document);

      const earlierJobs = await Promise.all(requiredMoves.slice(0, index).map((priorMove) =>
        store.getJob(ownerId, documentId, `${contract.slotId}__${priorMove.id}`),
      ));
      const priorBlocks = earlierJobs.flatMap((priorJob) => priorJob?.blocks ?? []);
      const allJobs = await store.listJobs(ownerId, documentId);
      const completedSectionSummaries = Object.values(document.slotStates)
        .filter((state) => state.status === 'complete')
        .map((state) => {
          const texts = allJobs
            .filter((completed) => completed.slotId === state.slotId && completed.status === 'complete')
            .flatMap((completed) => completed.blocks.map((block) => block.text));
          return `${state.role}: ${texts.join(' ').slice(0, 360)}`;
        })
        .slice(-4);

      try {
        const rawOutput = await generateSlotMove({
          slotId: contract.slotId,
          contract,
          move,
          decisions: document.decisions,
          sources: document.sources,
          completedSectionSummaries,
          repairReasons: job.failureReasons,
        });
        job = transitionJob(job, 'validating');
        slotState.jobs[move.id] = job.status;
        await store.saveJob(ownerId, documentId, job);

        const parsed = parseMoveOutput(rawOutput);
        const priorText = priorBlocks.map((block) => block.text);
        if (!parsed.success) {
          job = recordJobFailure(job, parsed.reasons);
          slotState.jobs[move.id] = job.status;
          slotState.status = job.status;
          if (job.status === 'flagged') document.status = 'needs_review';
          await store.saveJob(ownerId, documentId, job);
          await store.saveDocument(document);
          return job.status === 'flagged'
            ? { status: 'flagged', slotId: contract.slotId, moveId: move.id, reasons: parsed.reasons }
            : { status: 'needs_repair', slotId: contract.slotId, moveId: move.id, reasons: parsed.reasons };
        }

        const classified = await classifySlotRole(
          contract.role,
          parsed.data.blocks.map((block) => block.text).join('\n\n'),
          [...grammar.validRoles],
        );
        const validation = validateMove({
          output: parsed.data,
          contract,
          moveId: move.id,
          priorBlocks: priorText.map((text) => ({ text })),
          isLastMove: index === requiredMoves.length - 1,
          sources: document.sources,
          decisions: document.decisions,
          expectedRole: contract.role,
          classifiedRole: classified.role,
          grammarHeadings,
        });

        if (!validation.passed) {
          const reasons = validation.gates.filter((gate) => !gate.passed)
            .flatMap((gate) => gate.reasons.map((reason) => `${gate.gate}: ${reason}`));
          job = recordJobFailure(job, reasons);
          slotState.jobs[move.id] = job.status;
          slotState.status = job.status;
          if (job.status === 'flagged') document.status = 'needs_review';
          await store.saveJob(ownerId, documentId, job);
          await store.saveDocument(document);
          return job.status === 'flagged'
            ? { status: 'flagged', slotId: contract.slotId, moveId: move.id, reasons }
            : { status: 'needs_repair', slotId: contract.slotId, moveId: move.id, reasons };
        }

        job = { ...job, status: 'complete', failureReasons: [], blocks: parsed.data.blocks, updatedAt: new Date().toISOString() };
        slotState.jobs[move.id] = job.status;
        slotState.status = requiredMoves.every((part) => slotState.jobs[part.id] === 'complete')
          ? 'complete'
          : 'pending';
        await store.saveJob(ownerId, documentId, job);
        await store.saveDocument(document);
        return { status: 'move_complete', slotId: contract.slotId, moveId: move.id, blocks: job.blocks };
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Generation or validation failed unexpectedly.';
        job = recordJobFailure(job, [reason]);
        slotState.jobs[move.id] = job.status;
        slotState.status = job.status;
        if (job.status === 'flagged') document.status = 'needs_review';
        await store.saveJob(ownerId, documentId, job);
        await store.saveDocument(document);
        if (job.status === 'flagged') return { status: 'flagged', slotId: contract.slotId, moveId: move.id, reasons: job.failureReasons };
        throw error;
      }
    }
    slotState.status = 'complete';
  }

  const jobs = await store.listJobs(ownerId, documentId);
  const contentMap: ContentMap = new Map();
  for (const section of numbered.filter((item) => !item.node.isContainer)) {
    const contract = document.slotContracts[section.node.id];
    if (!contract) continue;
    const blocks = jobs
      .filter((job) => job.slotId === contract.slotId && job.status === 'complete')
      .sort((left, right) => contract.moves.findIndex((move) => move.id === left.moveId) - contract.moves.findIndex((move) => move.id === right.moveId))
      .flatMap((job) => job.blocks);
    if (blocks.length > 0) contentMap.set(contract.slotId, blocks);
  }
  const missingRequired = numbered
    .filter((section) => section.node.required && !section.node.isContainer)
    .filter((section) => {
      const slot = document.slotContracts[section.node.id];
      const state = document.slotStates[section.node.id];
      return !slot || !state || slot.moves.some((move) => state.jobs[move.id] !== 'complete')
        || !contentMap.get(section.node.id)?.length;
    })
    .map((section) => section.node.id);
  if (missingRequired.length > 0) {
    document.status = 'blocked';
    await store.saveDocument(document);
    return { status: 'needs_review', issues: missingRequired.map((slotId) => ({
      code: 'missing_required_slot',
      slotId,
      message: `Required slot "${slotId}" has not passed all move validations.`,
    })) };
  }
  const issues = auditDocument(grammar, document, contentMap);
  if (issues.length > 0) {
    document.status = 'needs_review';
    await store.saveDocument(document);
    return { status: 'needs_review', issues };
  }
  document.status = 'complete';
  await store.saveDocument(document);
  return { status: 'document_complete' };
}
