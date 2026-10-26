/**
 * @fileOverview Grammar registry — retrieves and locks grammars by document type.
 *
 * Once a grammar is selected for a document, it is locked. No sections from
 * another grammar can be inserted.
 *
 * @module src/lib/generator/grammar/registry
 */

import { DocumentType, GrammarDefinition, SectionNode, SectionRole } from './types';
import { researchProjectGrammar } from './research-project.grammar';
import { siwesReportGrammar } from './siwes-report.grammar';
import { termPaperGrammar } from './term-paper.grammar';
import { essayGrammar } from './essay.grammar';

// ---------------------------------------------------------------------------
// Internal registry map
// ---------------------------------------------------------------------------

const GRAMMAR_MAP: ReadonlyMap<DocumentType, GrammarDefinition> = new Map([
  ['research_project', researchProjectGrammar],
  ['siwes_report', siwesReportGrammar],
  ['term_paper', termPaperGrammar],
  ['essay', essayGrammar],
]);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get a grammar definition by document type.
 * Throws if the document type is unknown.
 */
export function getGrammar(documentType: DocumentType): GrammarDefinition {
  const grammar = GRAMMAR_MAP.get(documentType);
  if (!grammar) {
    throw new Error(`Unknown document type: "${documentType}". Valid types: ${Array.from(GRAMMAR_MAP.keys()).join(', ')}`);
  }
  return grammar;
}

/**
 * Get all available grammar definitions.
 */
export function getAllGrammars(): GrammarDefinition[] {
  return Array.from(GRAMMAR_MAP.values());
}

/**
 * Get all supported document types.
 */
export function getSupportedDocumentTypes(): DocumentType[] {
  return Array.from(GRAMMAR_MAP.keys());
}

/**
 * Validate that a section role is allowed in the given grammar.
 * Returns false if the role belongs to a different grammar (cross-contamination).
 */
export function isRoleValidForGrammar(role: SectionRole, grammar: GrammarDefinition): boolean {
  return grammar.validRoles.has(role);
}

/**
 * Validate that a SectionNode tree only contains roles valid for the grammar.
 * Returns an array of invalid role usages (empty = all valid).
 */
export function validateGrammarIntegrity(grammar: GrammarDefinition): Array<{ nodeId: string; role: SectionRole }> {
  const violations: Array<{ nodeId: string; role: SectionRole }> = [];

  function walk(node: SectionNode): void {
    if (!grammar.validRoles.has(node.role)) {
      violations.push({ nodeId: node.id, role: node.role });
    }
    for (const child of node.children) {
      walk(child);
    }
  }

  for (const section of grammar.sections) {
    walk(section);
  }

  return violations;
}

/**
 * Collect all leaf-level (non-container) section nodes from a grammar.
 * These are the nodes that need slot contracts and content generation.
 */
export function getWritableSections(grammar: GrammarDefinition): SectionNode[] {
  const result: SectionNode[] = [];

  function walk(node: SectionNode): void {
    if (!node.isContainer) {
      result.push(node);
    }
    for (const child of node.children) {
      walk(child);
    }
  }

  for (const section of grammar.sections) {
    walk(section);
  }

  return result;
}

/**
 * Find a section node by ID within a grammar.
 * Returns null if not found.
 */
export function findSectionById(grammar: GrammarDefinition, nodeId: string): SectionNode | null {
  function walk(node: SectionNode): SectionNode | null {
    if (node.id === nodeId) return node;
    for (const child of node.children) {
      const found = walk(child);
      if (found) return found;
    }
    return null;
  }

  for (const section of grammar.sections) {
    const found = walk(section);
    if (found) return found;
  }

  return null;
}
