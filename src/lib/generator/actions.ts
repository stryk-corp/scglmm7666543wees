'use server';

import { DocumentType, AcademicLevel, ProjectContext, OutlineNode } from './types';
import { generateDefaultOutline } from './engine/outline-builder';
import { getInquiryQuestions } from './engine/question-generator';
import { writeDocumentSection, SectionWriterInput } from '@/ai/flows/scholarverse-section-writer';
import { evaluateSectionCriteria, CriteriaEvaluatorInput } from '@/ai/flows/scholarverse-criteria-evaluator';

export async function createOutlineAction(
  documentType: DocumentType,
  title: string,
  academicLevel: AcademicLevel,
  context: ProjectContext,
  targetPagesMin: number = 10
): Promise<OutlineNode[]> {
  return generateDefaultOutline(documentType, title, academicLevel, context, targetPagesMin);
}

export async function fetchInquiryQuestionsAction(
  documentType: DocumentType,
  academicLevel: AcademicLevel,
  discipline: string
) {
  return getInquiryQuestions(documentType, academicLevel, discipline);
}

export async function generateSectionContentAction(input: SectionWriterInput) {
  try {
    const result = await writeDocumentSection(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error generating section:', error);
    return { success: false, error: error.message || 'Failed to generate section' };
  }
}

export async function evaluateSectionContentAction(input: CriteriaEvaluatorInput) {
  try {
    const result = await evaluateSectionCriteria(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error evaluating section:', error);
    return { success: false, error: error.message || 'Failed to evaluate section' };
  }
}
