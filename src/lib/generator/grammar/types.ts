/**
 * @fileOverview Core type definitions for the closed document grammar system.
 *
 * A grammar defines a fixed tree of section roles for a document type.
 * The model never writes headings, numbers, or structure — only the
 * renderer does, using these definitions.
 *
 * @module src/lib/generator/grammar/types
 */

// ---------------------------------------------------------------------------
// Document Type
// ---------------------------------------------------------------------------

export type DocumentType =
  | 'research_project'
  | 'siwes_report'
  | 'term_paper'
  | 'essay';

// ---------------------------------------------------------------------------
// Section Roles
// ---------------------------------------------------------------------------

/**
 * A role is a semantic identifier — never a heading.
 * The renderer maps roles to display headings via the grammar tree.
 */
export type SectionRole =
  // ── Research project / Term paper roles ──
  | 'abstract'
  | 'acknowledgement'
  | 'table_of_contents'
  | 'introduction'
  | 'background_of_study'
  | 'problem_statement'
  | 'objectives'
  | 'research_questions'
  | 'significance_and_scope'
  | 'definition_of_terms'
  | 'literature_review'
  | 'conceptual_review'
  | 'theoretical_framework'
  | 'empirical_review'
  | 'methodology'
  | 'research_design'
  | 'population_and_sampling'
  | 'data_collection'
  | 'data_analysis_method'
  | 'results_and_analysis'
  | 'results_presentation'
  | 'discussion'
  | 'summary_of_findings'
  | 'conclusion'
  | 'recommendations'
  | 'limitations'
  | 'references'
  // ── SIWES-specific roles ──
  | 'siwes_introduction'
  | 'siwes_history'
  | 'siwes_objectives'
  | 'siwes_stakeholders'
  | 'company_profile'
  | 'company_establishment'
  | 'company_mission_vision'
  | 'company_organogram'
  | 'department_operations'
  | 'department_attachment'
  | 'tools_equipment'
  | 'safety_protocols'
  | 'work_performed'
  | 'routine_duties'
  | 'key_projects'
  | 'skills_acquired'
  | 'challenges'
  | 'challenges_solutions'
  // ── Essay roles ──
  | 'essay_introduction'
  | 'thesis_statement'
  | 'primary_argument'
  | 'secondary_argument'
  | 'counterargument'
  | 'essay_conclusion';

// ---------------------------------------------------------------------------
// Section Node (Grammar Tree)
// ---------------------------------------------------------------------------

export interface SectionNode {
  /** Unique ID within this grammar, e.g. "rp-ch2-s1" */
  id: string;

  /** Semantic role — determines what move template to use */
  role: SectionRole;

  /** Display heading text (used by renderer, never by model) */
  displayHeading: string;

  /** Depth level: 1 = chapter, 2 = section, 3 = subsection */
  level: 1 | 2 | 3;

  /** Is this node required for document completion? */
  required: boolean;

  /** Ordering weight among siblings (lower = first) */
  order: number;

  /** Child sections */
  children: SectionNode[];

  /**
   * If true, this node is a structural container only
   * (e.g. a chapter heading) — no slot/moves are generated for it.
   * Content comes from its children.
   */
  isContainer: boolean;
}

// ---------------------------------------------------------------------------
// Grammar Definition
// ---------------------------------------------------------------------------

export interface GrammarDefinition {
  /** e.g. "research_project", "siwes_report", "term_paper", "essay" */
  documentType: DocumentType;

  /** Human-readable label */
  label: string;

  /** The root sections of the document tree */
  sections: SectionNode[];

  /** Roles allowed directly below each parent role in this grammar */
  allowedParents: Partial<Record<SectionRole, readonly (SectionRole | null)[]>>;

  /**
   * Roles that are valid in this grammar.
   * Used to reject cross-grammar contamination.
   */
  validRoles: ReadonlySet<SectionRole>;
}
