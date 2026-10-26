/**
 * @fileOverview Research Project grammar (5-chapter thesis structure).
 *
 * Chapter 1: Introduction
 * Chapter 2: Literature Review
 * Chapter 3: Methodology
 * Chapter 4: Results & Discussion
 * Chapter 5: Summary, Conclusion & Recommendations
 *
 * @module src/lib/generator/grammar/research-project.grammar
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
  'research_questions',
  'significance_and_scope',
  'definition_of_terms',
  'literature_review',
  'conceptual_review',
  'theoretical_framework',
  'empirical_review',
  'methodology',
  'research_design',
  'population_and_sampling',
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
    id: 'rp-acknowledgement',
    role: 'acknowledgement',
    displayHeading: 'Acknowledgement',
    level: 1,
    required: false,
    order: 1,
    children: [],
    isContainer: false,
  },
  {
    id: 'rp-abstract',
    role: 'abstract',
    displayHeading: 'Abstract',
    level: 1,
    required: true,
    order: 2,
    children: [],
    isContainer: false,
  },
  {
    id: 'rp-toc',
    role: 'table_of_contents',
    displayHeading: 'Table of Contents',
    level: 1,
    required: false,
    order: 3,
    children: [],
    isContainer: true, // Renderer generates this automatically
  },

  // ── Chapter 1: Introduction ──
  {
    id: 'rp-ch1',
    role: 'introduction',
    displayHeading: 'Introduction',
    level: 1,
    required: true,
    order: 4,
    isContainer: true,
    children: [
      {
        id: 'rp-ch1-s1',
        role: 'background_of_study',
        displayHeading: 'Background of the Study',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch1-s2',
        role: 'problem_statement',
        displayHeading: 'Statement of the Problem',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch1-s3',
        role: 'objectives',
        displayHeading: 'Objectives of the Study',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch1-s4',
        role: 'research_questions',
        displayHeading: 'Research Questions',
        level: 2,
        required: true,
        order: 4,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch1-s5',
        role: 'significance_and_scope',
        displayHeading: 'Significance and Scope of the Study',
        level: 2,
        required: true,
        order: 5,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch1-s6',
        role: 'definition_of_terms',
        displayHeading: 'Definition of Terms',
        level: 2,
        required: false,
        order: 6,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 2: Literature Review ──
  {
    id: 'rp-ch2',
    role: 'literature_review',
    displayHeading: 'Literature Review',
    level: 1,
    required: true,
    order: 5,
    isContainer: true,
    children: [
      {
        id: 'rp-ch2-s1',
        role: 'conceptual_review',
        displayHeading: 'Conceptual Framework and Core Definitions',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch2-s2',
        role: 'theoretical_framework',
        displayHeading: 'Theoretical Framework',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch2-s3',
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
    id: 'rp-ch3',
    role: 'methodology',
    displayHeading: 'Research Methodology',
    level: 1,
    required: true,
    order: 6,
    isContainer: true,
    children: [
      {
        id: 'rp-ch3-s1',
        role: 'research_design',
        displayHeading: 'Research Design and Strategy',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch3-s2',
        role: 'population_and_sampling',
        displayHeading: 'Population and Sampling Technique',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch3-s3',
        role: 'data_collection',
        displayHeading: 'Data Collection Methods and Instruments',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch3-s4',
        role: 'data_analysis_method',
        displayHeading: 'Method of Data Analysis',
        level: 2,
        required: true,
        order: 4,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 4: Results & Discussion ──
  {
    id: 'rp-ch4',
    role: 'results_and_analysis',
    displayHeading: 'Results, Analysis and Discussion',
    level: 1,
    required: true,
    order: 7,
    isContainer: true,
    children: [
      {
        id: 'rp-ch4-s1',
        role: 'results_presentation',
        displayHeading: 'Presentation and Analysis of Findings',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch4-s2',
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

  // ── Chapter 5: Summary, Conclusion & Recommendations ──
  {
    id: 'rp-ch5',
    role: 'conclusion',
    displayHeading: 'Summary, Conclusion and Recommendations',
    level: 1,
    required: true,
    order: 8,
    isContainer: true,
    children: [
      {
        id: 'rp-ch5-s1',
        role: 'summary_of_findings',
        displayHeading: 'Summary of Major Findings',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch5-s2',
        role: 'conclusion',
        displayHeading: 'Conclusion',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch5-s3',
        role: 'recommendations',
        displayHeading: 'Recommendations and Areas for Future Research',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
      {
        id: 'rp-ch5-s4',
        role: 'limitations',
        displayHeading: 'Limitations of the Study',
        level: 2,
        required: false,
        order: 4,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── References ──
  {
    id: 'rp-references',
    role: 'references',
    displayHeading: 'References',
    level: 1,
    required: true,
    order: 9,
    children: [],
    isContainer: false,
  },
];

export const researchProjectGrammar: GrammarDefinition = {
  documentType: 'research_project',
  label: 'Research Project (5-Chapter Thesis)',
  sections,
  allowedParents: getAllowedParentRoles(sections),
  validRoles: VALID_ROLES,
};
