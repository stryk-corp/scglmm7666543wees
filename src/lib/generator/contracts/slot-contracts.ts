import { calculateWordBudgets } from '../weighting/weighting-engine';
import { GrammarDefinition, SectionNode, SectionRole } from '../grammar/types';
import { SlotContract, DecisionField, Move } from './types';

const ROLE_READS: Partial<Record<SectionRole, DecisionField[]>> = {
  objectives: ['topic', 'objectives'],
  research_questions: ['topic', 'objectives', 'researchQuestions'],
  research_design: ['topic', 'objectives', 'researchQuestions', 'design', 'theory'],
  population_and_sampling: ['topic', 'objectives', 'population', 'sampling'],
  data_collection: ['topic', 'objectives', 'instruments'],
  data_analysis_method: ['objectives', 'analysisMethod'],
  conceptual_review: ['topic', 'keyTerms'],
  theoretical_framework: ['topic', 'theory', 'objectives'],
  empirical_review: ['topic', 'objectives'],
  discussion: ['topic', 'objectives', 'theory', 'analysisMethod'],
  limitations: ['design', 'population', 'objectives'],
  conclusion: ['topic', 'objectives', 'researchQuestions', 'analysisMethod'],
  recommendations: ['objectives', 'analysisMethod'],
};

const ROLE_INSTRUCTIONS: Partial<Record<SectionRole, string[]>> = {
  abstract: ['Summarize the approved topic, approach, and defensible conclusions without adding a heading.'],
  background_of_study: ['Establish the context and motivation for the approved research topic.'],
  problem_statement: ['Define the specific research problem and the gap it addresses.'],
  objectives: ['State the approved objectives precisely and preserve their scope.'],
  research_questions: ['Express the approved objectives as answerable research questions.'],
  significance_and_scope: ['Explain the study value and boundaries without expanding its approved scope.'],
  definition_of_terms: ['Define the approved key terms in the context of this study.'],
  conceptual_review: ['Explain concepts and relationships central to the approved topic.'],
  theoretical_framework: ['Explain the selected theory, its fit to the topic, and its limits.'],
  empirical_review: ['Synthesize only the supplied real studies, their methods, years, findings, and relevance.'],
  research_design: ['Describe the approved design and justify how it answers the research questions.'],
  population_and_sampling: ['Describe the approved population and sampling approach without inventing counts.'],
  data_collection: ['Describe the approved data instruments and collection procedure.'],
  data_analysis_method: ['Explain the approved analysis method and how it addresses each objective.'],
  results_presentation: ['Present only supplied findings and relate them to the approved objectives.'],
  discussion: ['Interpret supplied findings and compare them only with supplied source records.'],
  summary_of_findings: ['Summarize approved findings without introducing new evidence.'],
  conclusion: ['Draw a bounded conclusion from the approved objectives and supplied findings.'],
  recommendations: ['Give actionable recommendations supported by the approved findings.'],
  limitations: ['State study-scope and method limitations and explain their mitigations.'],
  references: ['List only supplied source records in the selected citation style.'],
  siwes_history: ['Describe the verified SIWES context relevant to the placement.'],
  siwes_objectives: ['Explain the placement objectives and scope from supplied facts.'],
  siwes_stakeholders: ['Describe stakeholder responsibilities using supplied project facts.'],
  company_establishment: ['Describe the host organization using supplied verified facts only.'],
  company_mission_vision: ['Describe the organization mission and vision only when supplied.'],
  company_organogram: ['Explain the supplied organizational structure without inventing roles.'],
  department_operations: ['Describe the assigned department and operations from supplied facts.'],
  department_attachment: ['Explain the student placement and assigned unit from supplied facts.'],
  tools_equipment: ['Describe supplied tools, equipment, and their actual use.'],
  safety_protocols: ['Describe safety procedures that were actually supplied or documented.'],
  routine_duties: ['Describe actual routine duties from the placement record.'],
  key_projects: ['Describe completed projects from the supplied placement record.'],
  skills_acquired: ['Describe demonstrated skills acquired from supplied tasks and projects.'],
  challenges_solutions: ['Describe encountered challenges and actual solutions from the placement record.'],
  essay_introduction: ['Introduce the approved thesis and scope of the essay.'],
  thesis_statement: ['State the approved thesis without altering its position.'],
  primary_argument: ['Develop the primary argument supporting the approved thesis.'],
  secondary_argument: ['Develop a distinct supporting argument for the approved thesis.'],
  counterargument: ['Present a fair counterargument and evidence-based response.'],
  essay_conclusion: ['Synthesize the essay argument without introducing new claims.'],
};

for (const role of [
  'siwes_history',
  'siwes_objectives',
  'siwes_stakeholders',
  'company_establishment',
  'company_mission_vision',
  'company_organogram',
  'department_operations',
  'department_attachment',
  'tools_equipment',
  'safety_protocols',
  'routine_duties',
  'key_projects',
  'skills_acquired',
  'challenges_solutions',
] as const) {
  ROLE_READS[role] = ['topic', 'contextFacts'];
}

const FORBIDDEN_BY_ROLE: Partial<Record<SectionRole, string[]>> = {
  limitations: ['challenges encountered during the internship', 'results', 'recommendations'],
  empirical_review: ['description of skills acquired', 'internship duties', 'unverified study'],
  theoretical_framework: ['unrelated theory', 'internship duties', 'unsupported framework'],
  literature_review: ['description of skills acquired', 'internship duties'],
  discussion: ['internship duties', 'unsupported results'],
  recommendations: ['new results', 'unrelated theory'],
};

const DECISION_ORDER: Partial<Record<SectionRole, number>> = {
  objectives: 10,
  research_questions: 11,
  research_design: 20,
  population_and_sampling: 21,
  data_collection: 22,
  data_analysis_method: 23,
  conceptual_review: 30,
  theoretical_framework: 31,
  empirical_review: 32,
  results_presentation: 40,
  discussion: 41,
  summary_of_findings: 50,
  conclusion: 51,
  recommendations: 52,
  limitations: 53,
  background_of_study: 60,
  problem_statement: 61,
  significance_and_scope: 62,
  definition_of_terms: 63,
  essay_introduction: 60,
  thesis_statement: 61,
  primary_argument: 30,
  secondary_argument: 31,
  counterargument: 32,
  essay_conclusion: 50,
  abstract: 70,
  references: 80,
};

function makeMoves(role: SectionRole, targetWords: number): Move[] {
  const instructions = ROLE_INSTRUCTIONS[role] ?? [`Write only content appropriate to the "${role}" section role.`];
  const count = targetWords >= 300 ? 3 : targetWords >= 120 ? 2 : 1;
  const maxEach = Math.ceil(targetWords / count * 1.35);

  if (count === 1) return [{ id: 'm1', instruction: instructions[0], maxWords: maxEach }];
  if (count === 2) {
    return [
      { id: 'm1', instruction: `${instructions[0]} Establish the central claim and its support.`, maxWords: maxEach },
      { id: 'm2', instruction: `Continue the ${role} argument with distinct detail and a concise synthesis.`, maxWords: maxEach },
    ];
  }
  return [
    { id: 'm1', instruction: `${instructions[0]} Establish the central scope and concepts.`, maxWords: maxEach },
    { id: 'm2', instruction: `Develop the evidence and analysis specific to ${role}.`, maxWords: maxEach },
    { id: 'm3', instruction: `Complete the ${role} reasoning with implications and a concise synthesis.`, maxWords: maxEach },
  ];
}

export function createSlotContracts(
  grammar: GrammarDefinition,
  targetPages: number,
): Record<string, SlotContract> {
  const budget = calculateWordBudgets(grammar, targetPages);
  const byId = new Map(budget.slots.map((slot) => [slot.slotId, slot]));
  const contracts: Record<string, SlotContract> = {};

  function visit(node: SectionNode): void {
    if (!node.isContainer) {
      const words = byId.get(node.id);
      if (!words) throw new Error(`Missing word budget for section "${node.id}".`);
      contracts[node.id] = {
        slotId: node.id,
        role: node.role,
        reads: ROLE_READS[node.role] ?? ['topic'],
        moves: makeMoves(node.role, words.target),
        mustNotContain: FORBIDDEN_BY_ROLE[node.role] ?? [],
        blockTypes: ['paragraph', 'definition_list', 'enumerated_list'],
        minWords: words.min,
        targetWords: words.target,
        maxWords: words.max,
        requiresSources: node.role === 'empirical_review' || node.role === 'discussion' || node.role === 'references',
      };
    }
    node.children.forEach(visit);
  }

  grammar.sections.forEach(visit);
  return contracts;
}

export function orderSlotsByDependency(
  grammar: GrammarDefinition,
  contracts: Record<string, SlotContract>,
): SlotContract[] {
  const originalOrder = new Map<string, number>();
  let index = 0;

  function visit(node: SectionNode): void {
    if (!node.isContainer) originalOrder.set(node.id, index++);
    node.children.forEach(visit);
  }
  grammar.sections.forEach(visit);

  return Object.values(contracts).sort((left, right) => {
    const priority = (DECISION_ORDER[left.role] ?? 35) - (DECISION_ORDER[right.role] ?? 35);
    return priority || (originalOrder.get(left.slotId) ?? 0) - (originalOrder.get(right.slotId) ?? 0);
  });
}
