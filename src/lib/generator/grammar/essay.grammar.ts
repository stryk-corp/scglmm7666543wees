/**
 * @fileOverview Academic Essay grammar.
 *
 * A simpler structure than research projects:
 * Section 1: Introduction & Thesis Framing
 * Section 2: Primary Argument
 * Section 3: Secondary Argument
 * Section 4: Counterarguments & Rebuttal
 * Section 5: Conclusion & Synthesis
 *
 * @module src/lib/generator/grammar/essay.grammar
 */

import { GrammarDefinition, SectionNode, SectionRole } from './types';
import { getAllowedParentRoles } from './integrity';

const VALID_ROLES: ReadonlySet<SectionRole> = new Set<SectionRole>([
  'essay_introduction',
  'thesis_statement',
  'primary_argument',
  'secondary_argument',
  'counterargument',
  'essay_conclusion',
  'references',
]);

const sections: SectionNode[] = [
  // ── Section 1: Introduction & Thesis ──
  {
    id: 'essay-intro',
    role: 'essay_introduction',
    displayHeading: 'Introduction and Thesis Framing',
    level: 1,
    required: true,
    order: 1,
    isContainer: true,
    children: [
      {
        id: 'essay-intro-s1',
        role: 'essay_introduction',
        displayHeading: 'Context and Background',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'essay-intro-s2',
        role: 'thesis_statement',
        displayHeading: 'Thesis Statement',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Section 2: Primary Argument ──
  {
    id: 'essay-body-1',
    role: 'primary_argument',
    displayHeading: 'Primary Argument and Theoretical Foundation',
    level: 1,
    required: true,
    order: 2,
    children: [],
    isContainer: false,
  },

  // ── Section 3: Secondary Argument ──
  {
    id: 'essay-body-2',
    role: 'secondary_argument',
    displayHeading: 'Secondary Analysis and Real-World Application',
    level: 1,
    required: true,
    order: 3,
    children: [],
    isContainer: false,
  },

  // ── Section 4: Counterarguments ──
  {
    id: 'essay-counter',
    role: 'counterargument',
    displayHeading: 'Counterarguments and Critical Rebuttal',
    level: 1,
    required: true,
    order: 4,
    children: [],
    isContainer: false,
  },

  // ── Section 5: Conclusion ──
  {
    id: 'essay-conclusion',
    role: 'essay_conclusion',
    displayHeading: 'Conclusion and Academic Synthesis',
    level: 1,
    required: true,
    order: 5,
    children: [],
    isContainer: false,
  },

  // ── References ──
  {
    id: 'essay-references',
    role: 'references',
    displayHeading: 'References',
    level: 1,
    required: true,
    order: 6,
    children: [],
    isContainer: false,
  },
];

export const essayGrammar: GrammarDefinition = {
  documentType: 'essay',
  label: 'Academic Essay',
  sections,
  allowedParents: getAllowedParentRoles(sections),
  validRoles: VALID_ROLES,
};
