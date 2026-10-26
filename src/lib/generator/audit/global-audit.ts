import { GenerationDocument, Source } from '../contracts/types';
import { GrammarDefinition } from '../grammar/types';
import { computeNumbering, flattenNumberedSections } from '../grammar/numbering';
import { ContentMap, findMissingRequiredSections, validateContentMap } from '../renderer/document-assembler';
import { validateEvidence } from '../validation/gates';
import { MoveOutput } from '../contracts/types';

export interface AuditIssue {
  code: 'missing_required_slot' | 'orphan_slot' | 'out_of_order' | 'duplicate_ideas' | 'missing_source' | 'inconsistent_theory';
  slotId?: string;
  message: string;
}

function normalizedNgrams(text: string, size = 5): Set<string> {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const result = new Set<string>();
  for (let i = 0; i <= words.length - size; i++) result.add(words.slice(i, i + size).join(' '));
  return result;
}

function sourceClaimIssues(document: GenerationDocument, contentMap: ContentMap, sources: Source[]): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const [slotId, blocks] of contentMap.entries()) {
    if (!document.slotContracts[slotId]?.requiresSources) continue;
    const output: MoveOutput = {
      slot_id: slotId,
      move_id: 'audit',
      blocks: blocks.map((block) => ({
        type: block.type,
        text: block.text,
        sourceIds: block.sourceIds ?? [],
      })),
      source_ids: [...new Set(blocks.flatMap((block) => block.sourceIds ?? []))],
      complete: true,
    };
    const reasons = validateEvidence(output, sources);
    reasons.forEach((reason) => issues.push({ code: 'missing_source', slotId, message: reason }));
  }
  return issues;
}

export function auditDocument(
  grammar: GrammarDefinition,
  document: GenerationDocument,
  contentMap: ContentMap,
  sources: Source[] = document.sources,
): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slotId of findMissingRequiredSections(grammar, contentMap)) {
    issues.push({ code: 'missing_required_slot', slotId, message: `Required section "${slotId}" has no approved content.` });
  }
  for (const slotId of validateContentMap(grammar, contentMap)) {
    issues.push({ code: 'orphan_slot', slotId, message: `Content is not part of the locked ${grammar.documentType} grammar.` });
  }

  const grammarOrder = flattenNumberedSections(computeNumbering(grammar.sections))
    .filter((section) => !section.node.isContainer)
    .map((section) => section.node.id);
  const generatedOrder = Array.from(contentMap.keys()).filter((slotId) => contentMap.get(slotId)?.length);
  const sortedGenerated = [...generatedOrder].sort((left, right) => grammarOrder.indexOf(left) - grammarOrder.indexOf(right));
  if (generatedOrder.some((slotId, index) => sortedGenerated[index] !== slotId)) {
    issues.push({ code: 'out_of_order', message: 'Generated slots do not follow grammar tree order.' });
  }

  const sections = Object.keys(document.slotContracts);
  for (let left = 0; left < sections.length; left++) {
    const leftText = (contentMap.get(sections[left]) ?? []).map((block) => block.text).join(' ');
    const leftNgrams = normalizedNgrams(leftText);
    if (leftNgrams.size === 0) continue;
    for (let right = left + 1; right < sections.length; right++) {
      const rightNgrams = normalizedNgrams((contentMap.get(sections[right]) ?? []).map((block) => block.text).join(' '));
      if (rightNgrams.size === 0) continue;
      let common = 0;
      for (const gram of leftNgrams) if (rightNgrams.has(gram)) common++;
      const similarity = common / Math.min(leftNgrams.size, rightNgrams.size);
      if (similarity >= 0.2 && common >= 4) {
        issues.push({
          code: 'duplicate_ideas',
          slotId: sections[right],
          message: `Substantial repeated phrasing is shared with section "${sections[left]}" (${Math.round(similarity * 100)}% n-gram overlap).`,
        });
      }
    }
  }

  if (document.decisions.theory) {
    const theoryName = document.decisions.theory.name.toLowerCase();
    const alternateFrameworks = ['technology acceptance model', 'diffusion of innovations', 'theory of planned behavior', 'resource-based view'];
    for (const [slotId, contract] of Object.entries(document.slotContracts)) {
      if (!contract.reads.includes('theory')) continue;
      const text = (contentMap.get(slotId) ?? []).map((block) => block.text).join(' ').toLowerCase();
      for (const theory of alternateFrameworks) {
        if (theory !== theoryName && text.includes(theory)) {
          issues.push({ code: 'inconsistent_theory', slotId, message: `Section uses "${theory}" instead of registered theory "${document.decisions.theory.name}".` });
        }
      }
    }
  }

  issues.push(...sourceClaimIssues(document, contentMap, sources));
  return issues;
}
