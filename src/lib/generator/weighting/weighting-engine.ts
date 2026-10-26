/**
 * @fileOverview Word budget distribution engine.
 *
 * Distributes the total word budget across slots by importance and depth,
 * not equally. Each slot gets target, min, and max words.
 *
 * @module src/lib/generator/weighting/weighting-engine
 */

import { GrammarDefinition, SectionNode, DocumentType } from '../grammar/types';
import { getWritableSections } from '../grammar/registry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SlotWordBudget {
  /** Grammar section node ID */
  slotId: string;

  /** Section role */
  role: string;

  /** Target word count */
  target: number;

  /** Minimum acceptable word count */
  min: number;

  /** Maximum acceptable word count */
  max: number;
}

export interface DocumentWordBudget {
  /** Total words available for the document body */
  totalWords: number;

  /** Per-slot budgets */
  slots: SlotWordBudget[];
}

// ---------------------------------------------------------------------------
// Weight Profiles
// ---------------------------------------------------------------------------

/**
 * Role importance weights (higher = more words allocated).
 * These are relative weights within the document — the engine normalizes them.
 */
const ROLE_WEIGHTS: Record<string, number> = {
  // ── Research Project / Term Paper ──
  abstract: 0.5,
  acknowledgement: 0.3,
  background_of_study: 1.2,
  problem_statement: 0.8,
  objectives: 0.6,
  research_questions: 0.5,
  significance_and_scope: 0.7,
  definition_of_terms: 0.5,
  conceptual_review: 1.5,
  theoretical_framework: 1.4,
  empirical_review: 2.0,
  research_design: 1.0,
  population_and_sampling: 0.8,
  data_collection: 0.9,
  data_analysis_method: 0.8,
  results_presentation: 1.8,
  discussion: 1.6,
  summary_of_findings: 0.8,
  conclusion: 0.7,
  recommendations: 0.6,
  limitations: 0.5,
  references: 0.2,

  // ── SIWES ──
  siwes_history: 1.0,
  siwes_objectives: 0.7,
  siwes_stakeholders: 0.7,
  company_establishment: 1.0,
  company_mission_vision: 0.7,
  company_organogram: 0.8,
  department_attachment: 1.0,
  tools_equipment: 1.2,
  safety_protocols: 0.6,
  routine_duties: 1.3,
  key_projects: 1.8,
  skills_acquired: 1.4,
  challenges_solutions: 1.0,

  // ── Essay ──
  essay_introduction: 0.8,
  thesis_statement: 0.5,
  primary_argument: 1.6,
  secondary_argument: 1.4,
  counterargument: 1.3,
  essay_conclusion: 0.8,
};

/** Default weight for roles not explicitly listed */
const DEFAULT_WEIGHT = 1.0;

/** Min/max as percentage of target */
const MIN_RATIO = 0.7;
const MAX_RATIO = 1.4;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate word budgets for all writable slots in a grammar.
 *
 * @param grammar       The locked grammar definition
 * @param targetPages   User-specified target page count
 * @param wordsPerPage  Approximate words per page (default: 250 for double-spaced)
 * @returns             Document-level and per-slot word budgets
 */
export function calculateWordBudgets(
  grammar: GrammarDefinition,
  targetPages: number,
  wordsPerPage: number = 250,
): DocumentWordBudget {
  const writableSections = getWritableSections(grammar);

  // Reserve pages for cover, TOC, prelims
  const prelimPages = estimatePrelimPages(grammar.documentType, targetPages);
  const bodyPages = Math.max(2, targetPages - prelimPages);
  const totalWords = Math.round(bodyPages * wordsPerPage);

  // Compute raw weights
  const rawWeights = writableSections.map((node) => ({
    node,
    weight: getWeight(node),
  }));

  const totalWeight = rawWeights.reduce((sum, w) => sum + w.weight, 0);

  // Distribute proportionally
  const slots: SlotWordBudget[] = rawWeights.map(({ node, weight }) => {
    const proportion = weight / totalWeight;
    const target = Math.round(totalWords * proportion);
    return {
      slotId: node.id,
      role: node.role,
      target,
      min: Math.round(target * MIN_RATIO),
      max: Math.round(target * MAX_RATIO),
    };
  });

  return { totalWords, slots };
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function getWeight(node: SectionNode): number {
  const baseWeight = ROLE_WEIGHTS[node.role] ?? DEFAULT_WEIGHT;

  // Boost deeper sections slightly less (they tend to be shorter)
  const depthFactor = node.level === 1 ? 1.0 : node.level === 2 ? 0.95 : 0.85;

  return baseWeight * depthFactor;
}

function estimatePrelimPages(docType: DocumentType, targetPages: number): number {
  switch (docType) {
    case 'siwes_report':
      // Cover, Ack, Abstract, TOC, LOF
      return 5;
    case 'research_project':
      // Cover, Ack, Abstract, TOC, LOT, LOF
      return targetPages >= 30 ? 6 : 4;
    case 'term_paper':
      // Cover, Abstract, TOC
      return targetPages >= 8 ? 3 : 1;
    case 'essay':
      // Cover page or header only
      return 1;
    default:
      return 2;
  }
}
