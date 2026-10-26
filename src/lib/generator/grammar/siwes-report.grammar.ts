/**
 * @fileOverview SIWES (Students Industrial Work Experience Scheme) report grammar.
 *
 * Chapter 1: Introduction to SIWES
 * Chapter 2: Company Profile
 * Chapter 3: Department Operations, Equipment & Safety
 * Chapter 4: Work Performed, Projects & Skills Acquired
 * Chapter 5: Challenges, Conclusion & Recommendations
 *
 * @module src/lib/generator/grammar/siwes-report.grammar
 */

import { GrammarDefinition, SectionNode, SectionRole } from './types';
import { getAllowedParentRoles } from './integrity';

const VALID_ROLES: ReadonlySet<SectionRole> = new Set<SectionRole>([
  'abstract',
  'acknowledgement',
  'table_of_contents',
  'siwes_introduction',
  'siwes_history',
  'siwes_objectives',
  'siwes_stakeholders',
  'company_profile',
  'company_establishment',
  'company_mission_vision',
  'company_organogram',
  'department_operations',
  'department_attachment',
  'tools_equipment',
  'safety_protocols',
  'work_performed',
  'routine_duties',
  'key_projects',
  'skills_acquired',
  'challenges',
  'challenges_solutions',
  'conclusion',
  'recommendations',
  'references',
]);

const sections: SectionNode[] = [
  // ── Preliminary pages ──
  {
    id: 'siwes-acknowledgement',
    role: 'acknowledgement',
    displayHeading: 'Acknowledgement',
    level: 1,
    required: false,
    order: 1,
    children: [],
    isContainer: false,
  },
  {
    id: 'siwes-abstract',
    role: 'abstract',
    displayHeading: 'Abstract',
    level: 1,
    required: true,
    order: 2,
    children: [],
    isContainer: false,
  },
  {
    id: 'siwes-toc',
    role: 'table_of_contents',
    displayHeading: 'Table of Contents',
    level: 1,
    required: false,
    order: 3,
    children: [],
    isContainer: true,
  },

  // ── Chapter 1: Introduction to SIWES ──
  {
    id: 'siwes-ch1',
    role: 'siwes_introduction',
    displayHeading: 'Introduction to SIWES',
    level: 1,
    required: true,
    order: 4,
    isContainer: true,
    children: [
      {
        id: 'siwes-ch1-s1',
        role: 'siwes_history',
        displayHeading: 'Background and History of SIWES and ITF',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch1-s2',
        role: 'siwes_objectives',
        displayHeading: 'Objectives and Scope of Industrial Training',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch1-s3',
        role: 'siwes_stakeholders',
        displayHeading: 'Roles of Stakeholders (Institutions, Employers and Students)',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 2: Company Profile ──
  {
    id: 'siwes-ch2',
    role: 'company_profile',
    displayHeading: 'Profile of the Host Organization',
    level: 1,
    required: true,
    order: 5,
    isContainer: true,
    children: [
      {
        id: 'siwes-ch2-s1',
        role: 'company_establishment',
        displayHeading: 'Establishment, Location and Core Mandate',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch2-s2',
        role: 'company_mission_vision',
        displayHeading: 'Mission, Vision and Core Values',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch2-s3',
        role: 'company_organogram',
        displayHeading: 'Organizational Structure (Organogram and Hierarchy)',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 3: Department Operations ──
  {
    id: 'siwes-ch3',
    role: 'department_operations',
    displayHeading: 'Department Operations, Equipment and Safety',
    level: 1,
    required: true,
    order: 6,
    isContainer: true,
    children: [
      {
        id: 'siwes-ch3-s1',
        role: 'department_attachment',
        displayHeading: 'Department of Attachment and Routine Functions',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch3-s2',
        role: 'tools_equipment',
        displayHeading: 'Instruments, Tools, Hardware and Software Utilized',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch3-s3',
        role: 'safety_protocols',
        displayHeading: 'Occupational Health, Safety and Environmental Protocols',
        level: 2,
        required: false,
        order: 3,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 4: Work Performed ──
  {
    id: 'siwes-ch4',
    role: 'work_performed',
    displayHeading: 'Work Performed, Projects and Technical Skills Acquired',
    level: 1,
    required: true,
    order: 7,
    isContainer: true,
    children: [
      {
        id: 'siwes-ch4-s1',
        role: 'routine_duties',
        displayHeading: 'Routine Maintenance, Workflows and Operational Duties',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch4-s2',
        role: 'key_projects',
        displayHeading: 'Key Technical Projects Executed',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch4-s3',
        role: 'skills_acquired',
        displayHeading: 'Practical Skills and Industrial Knowledge Acquired',
        level: 2,
        required: true,
        order: 3,
        children: [],
        isContainer: false,
      },
    ],
  },

  // ── Chapter 5: Challenges, Conclusion & Recommendations ──
  {
    id: 'siwes-ch5',
    role: 'challenges',
    displayHeading: 'Challenges, Conclusion and Recommendations',
    level: 1,
    required: true,
    order: 8,
    isContainer: true,
    children: [
      {
        id: 'siwes-ch5-s1',
        role: 'challenges_solutions',
        displayHeading: 'Challenges Encountered and Problem-Solving Strategies',
        level: 2,
        required: true,
        order: 1,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch5-s2',
        role: 'conclusion',
        displayHeading: 'Conclusion',
        level: 2,
        required: true,
        order: 2,
        children: [],
        isContainer: false,
      },
      {
        id: 'siwes-ch5-s3',
        role: 'recommendations',
        displayHeading: 'Recommendations to the Institution, ITF and Employer',
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
    id: 'siwes-references',
    role: 'references',
    displayHeading: 'References and Appendices',
    level: 1,
    required: false,
    order: 9,
    children: [],
    isContainer: false,
  },
];

export const siwesReportGrammar: GrammarDefinition = {
  documentType: 'siwes_report',
  label: 'SIWES / Industrial Training Report',
  sections,
  allowedParents: getAllowedParentRoles(sections),
  validRoles: VALID_ROLES,
};
