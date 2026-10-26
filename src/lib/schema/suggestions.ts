import { z } from 'zod';

export const SuggestibleFieldsSchema = z.enum([
  'courseCode',
  'fieldOfStudy',
  'primarySkill',
  'technologiesUsed',
  'programmingLanguage',
  'framework',
  'careerPath',
  'challengesText',
  'conclusionText',
  'projectsDescription',
  'companyVision',
  'companyMission',
  'companyValues',
  'organogramAbbreviations',
  'referencesText',
  'thesisStatement',
  'researchQuestions',
  'reportTitle',
]);
export type SuggestibleFields = z.infer<typeof SuggestibleFieldsSchema>;
