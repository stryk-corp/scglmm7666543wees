/**
 * @fileOverview Document assembler.
 *
 * Takes a grammar tree + approved content blocks and produces a
 * RenderedDocument with proper section ordering and computed numbering.
 *
 * This is the bridge between the state machine (which tracks completed
 * moves/slots) and the renderer (which formats the output).
 *
 * @module src/lib/generator/renderer/document-assembler
 */

import { GrammarDefinition, SectionNode } from '../grammar/types';
import { computeNumbering, NumberedSection } from '../grammar/numbering';
import { Block, RenderedDocument, RenderedSection, RenderedHeading } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A map from section node ID → approved content blocks.
 * Empty array or missing key means no content yet.
 */
export type ContentMap = Map<string, Block[]>;

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

/**
 * Assemble a complete RenderedDocument from a grammar and content map.
 *
 * @param grammar     The locked grammar for this document
 * @param contentMap  Approved blocks keyed by section node ID
 * @param title       Document title
 * @returns           A fully ordered RenderedDocument ready for rendering
 */
export function assembleDocument(
  grammar: GrammarDefinition,
  contentMap: ContentMap,
  title: string,
): RenderedDocument {
  const numbered = computeNumbering(grammar.sections);
  const sections = flattenToRenderedSections(numbered, contentMap);

  return {
    title,
    documentType: grammar.documentType,
    sections,
  };
}

/**
 * Assemble only a subset of sections (e.g. for partial preview).
 */
export function assemblePartial(
  grammar: GrammarDefinition,
  contentMap: ContentMap,
  title: string,
  nodeIds: Set<string>,
): RenderedDocument {
  const numbered = computeNumbering(grammar.sections);
  const allSections = flattenToRenderedSections(numbered, contentMap);
  const filtered = allSections.filter(
    (s) => nodeIds.has(s.nodeId) || s.heading.isContainer,
  );

  return {
    title,
    documentType: grammar.documentType,
    sections: filtered,
  };
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively flatten the numbered tree into an ordered array of RenderedSections.
 */
function flattenToRenderedSections(
  numbered: NumberedSection[],
  contentMap: ContentMap,
): RenderedSection[] {
  const result: RenderedSection[] = [];

  function walk(section: NumberedSection): void {
    const heading: RenderedHeading = {
      number: section.number,
      text: section.node.displayHeading,
      level: section.node.level,
      isContainer: section.node.isContainer,
    };

    const blocks = contentMap.get(section.node.id) ?? [];

    result.push({
      nodeId: section.node.id,
      heading,
      blocks,
    });

    for (const child of section.children) {
      walk(child);
    }
  }

  for (const section of numbered) {
    walk(section);
  }

  return result;
}

/**
 * Validate that a content map only contains keys that exist in the grammar.
 * Returns invalid node IDs (empty = all valid).
 */
export function validateContentMap(
  grammar: GrammarDefinition,
  contentMap: ContentMap,
): string[] {
  const validIds = new Set<string>();

  function collectIds(node: SectionNode): void {
    validIds.add(node.id);
    for (const child of node.children) {
      collectIds(child);
    }
  }

  for (const section of grammar.sections) {
    collectIds(section);
  }

  const invalidIds: string[] = [];
  for (const key of contentMap.keys()) {
    if (!validIds.has(key)) {
      invalidIds.push(key);
    }
  }

  return invalidIds;
}

/**
 * Check completeness: are all required sections filled?
 * Returns an array of missing required section IDs (empty = complete).
 */
export function findMissingRequiredSections(
  grammar: GrammarDefinition,
  contentMap: ContentMap,
): string[] {
  const missing: string[] = [];

  function check(node: SectionNode): void {
    if (node.required && !node.isContainer) {
      const blocks = contentMap.get(node.id);
      if (!blocks || blocks.length === 0) {
        missing.push(node.id);
      }
    }
    for (const child of node.children) {
      check(child);
    }
  }

  for (const section of grammar.sections) {
    check(section);
  }

  return missing;
}
