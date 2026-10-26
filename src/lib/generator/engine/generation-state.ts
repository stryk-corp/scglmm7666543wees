import { GenerationJob, MoveStatus } from '../contracts/types';

const ALLOWED_TRANSITIONS: Record<MoveStatus, readonly MoveStatus[]> = {
  pending: ['generating', 'blocked_needs_sources'],
  generating: ['validating', 'failed', 'needs_repair'],
  validating: ['complete', 'needs_repair', 'failed', 'flagged'],
  complete: [],
  needs_repair: ['generating'],
  failed: ['generating', 'flagged'],
  flagged: ['generating'],
  blocked_needs_sources: ['pending'],
};

export function transitionJob(job: GenerationJob, next: MoveStatus, now = new Date().toISOString()): GenerationJob {
  if (!ALLOWED_TRANSITIONS[job.status].includes(next)) {
    throw new Error(`Invalid generation transition: ${job.status} -> ${next} for ${job.id}.`);
  }
  return { ...job, status: next, updatedAt: now };
}

export function recordJobFailure(
  job: GenerationJob,
  reasons: string[],
  now = new Date().toISOString(),
): GenerationJob {
  const status: MoveStatus = job.attempts >= job.maxRetries ? 'flagged' : 'needs_repair';
  return {
    ...job,
    status,
    failureReasons: [...reasons],
    updatedAt: now,
  };
}

export function createGenerationJob(documentId: string, slotId: string, moveId: string): GenerationJob {
  return {
    id: `${slotId}__${moveId}`,
    documentId,
    slotId,
    moveId,
    status: 'pending',
    attempts: 0,
    maxRetries: 3,
    failureReasons: [],
    blocks: [],
    updatedAt: new Date().toISOString(),
  };
}
