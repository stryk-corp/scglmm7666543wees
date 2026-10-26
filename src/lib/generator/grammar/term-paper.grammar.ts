/**
 * @fileOverview Term Paper grammar (5-chapter academic paper structure).
 *
 * Similar to research_project but designed for shorter papers.
 * Shares many roles but differs in required sections and depth expectations.
 *
 * Chapter 1: Introduction
 * Chapter 2: Literature Review
 * Chapter 3: Methodology
 * Chapter 4: Results, Analysis & Discussion
 * Chapter 5: Summary, Conclusions & Recommendations
 *
 * @module src/lib/generator/grammar/term-paper.grammar
 */

import { GrammarDefinition, SectionNode, SectionRole } from './types';
import { getAllowedParentRoles } from './integrity';

const VALID_ROLES: ReadonlySet<SectionRole> = new Set<SectionRole>([
  'abstract',
  'acknowledgement',
  'table_of_contents',
  'introduction',
  'background_of_study',
  'problem_statement',
  'objectives',
  'significance_and_scope',
  'literature_review',
  'conceptual_review',
  'theoretical_framework',
  'empirical_review',
  'methodology',
  'research_design',
  'data_collection',
  'data_analysis_method',
  'results_and_analysis',
  'results_presentation',
  'discussion',
  'summary_of_findings',
  'conclusion',
  'recommendations',
  'limitations',
  'references',
]);

const sections: SectionNode[] = [
  // ── Preliminary pages ──
  {
    id: 'tp-abstract',
    role: 'abstract',
    displayHeading: 'Abstract',
    level: 1,
    required: true,
    order: 1,
    children: [],
    isContainer: false,
  },
  {
    id: 'tp-toc',
    role: 'table_of_contents',
    displayHeading: 'Table of Contents',
    level: 1,
    required: false,
    order: 2,
    children: [],
    isContainer: true,
  },

  // ── Chapter 1: Introduction ──
  {
    id: 'tp-ch1',
    role: 'introduction',
    displayHeading: 'Introduction',
    level: 1,
    required: true,
    order: 3,
    isContainer: true,
    children: [
      {
        id: 'tp-ch1-s1',
        role: 'background_of_study',
        displayHeading: 'Background of the Study',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch1-s2',
        role: 'problem_statement',
        displayHeading: 'Statement of the Problem',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch1-s3',
        role: 'objectives',
        displayHeading: 'Objectives of the Study',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch1-s4',
        role: 'significance_and_scope',
        displayHeading: 'Significance and Scope of the Study',
        level: 2,
        required: true,
        order: 4,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 2: Literature Review ──
  {
    id: 'tp-ch2',
    role: 'literature_review',
    displayHeading: 'Literature Review',
    level: 1,
    required: true,
    order: 4,
    isContainer: true,
    children: [
      {
        id: 'tp-ch2-s1',
        role: 'conceptual_review',
        displayHeading: 'Conceptual Framework and Core Definitions',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch2-s2',
        role: 'theoretical_framework',
        displayHeading: 'Theoretical Framework',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch2-s3',
        role: 'empirical_review',
        displayHeading: 'Empirical Literature Review',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 3: Methodology ──
  {
    id: 'tp-ch3',
    role: 'methodology',
    displayHeading: 'Methodology',
    level: 1,
    required: true,
    order: 5,
    isContainer: true,
    children: [
      {
        id: 'tp-ch3-s1',
        role: 'research_design',
        displayHeading: 'Research Design and Strategy',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch3-s2',
        role: 'data_collection',
        displayHeading: 'Data Collection and Sources',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch3-s3',
        role: 'data_analysis_method',
        displayHeading: 'Data Analysis Techniques and Limitations',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 4: Results, Analysis & Discussion ──
  {
    id: 'tp-ch4',
    role: 'results_and_analysis',
    displayHeading: 'Results, Analysis and Discussion',
    level: 1,
    required: true,
    order: 6,
    isContainer: true,
    children: [
      {
        id: 'tp-ch4-s1',
        role: 'results_presentation',
        displayHeading: 'Presentation and Thematic Analysis of Findings',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch4-s2',
        role: 'discussion',
        displayHeading: 'Discussion and Synthesis with Prior Literature',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 5: Summary, Conclusions & Recommendations ──
  {
    id: 'tp-ch5',
    role: 'conclusion',
    displayHeading: 'Summary, Conclusions and Recommendations',
    level: 1,
    required: true,
    order: 7,
    isContainer: true,
    children: [
      {
        id: 'tp-ch5-s1',
        role: 'summary_of_findings',
        displayHeading: 'Summary of Major Findings',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch5-s2',
        role: 'conclusion',
        displayHeading: 'Conclusion',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'tp-ch5-s3',
        role: 'recommendations',
        displayHeading: 'Recommendations and Areas for Future Research',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── References ──
  {
    id: 'tp-references',
    role: 'references',
    displayHeading: 'References',
    level: 1,
    required: true,
    order: 8,
    children: [],
    isContainer: false,
  },
];

export const termPaperGrammar: GrammarDefinition = {
  documentType: 'term_paper',
  label: 'Term Paper',
  sections,
  allowedParents: getAllowedParentRoles(sections),
  validRoles: VALID_ROLES,
};
