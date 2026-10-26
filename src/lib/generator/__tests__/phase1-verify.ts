/**
 * @fileOverview Phase 1 Verification Script
 *
 * Proves that the grammar engine, numbering, weighting, assembler, and
 * preview renderer work correctly with dummy text.
 *
 * Run with: npx tsx src/lib/generator/__tests__/phase1-verify.ts
 */

import { getGrammar, getAllGrammars, getWritableSections, validateGrammarIntegrity } from '../grammar/registry';
import { computeNumbering, flattenNumberedSections, validateNumbering, buildNumberMap } from '../grammar/numbering';
import { assembleDocument, findMissingRequiredSections, ContentMap } from '../renderer/document-assembler';
import { renderToPreviewHtml } from '../renderer/preview-renderer';
import { calculateWordBudgets } from '../weighting/weighting-engine';
import { Block } from '../renderer/types';
import { DocumentType } from '../grammar/types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passCount++;
    console.log(`  ✅ ${message}`);
  } else {
    failCount++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function section(title: string): void {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(70)}`);
}

// ---------------------------------------------------------------------------
// Test 1: Grammar Loading & Integrity
// ---------------------------------------------------------------------------

section('TEST 1: Grammar Loading & Integrity');

const allGrammars = getAllGrammars();
assert(allGrammars.length === 4, `Found ${allGrammars.length} grammars (expected 4)`);

for (const grammar of allGrammars) {
  console.log(`\n  --- ${grammar.label} (${grammar.documentType}) ---`);

  // Integrity check: all roles in the tree must be in validRoles
  const violations = validateGrammarIntegrity(grammar);
  assert(violations.length === 0, `No role violations (found ${violations.length})`);
  if (violations.length > 0) {
    violations.forEach((v) => console.error(`    ⚠ Node "${v.nodeId}" has invalid role "${v.role}"`));
  }

  // Count sections
  const writable = getWritableSections(grammar);
  assert(writable.length > 0, `Has ${writable.length} writable sections`);

  // Check all writable sections are non-containers
  const containerWritable = writable.filter((s) => s.isContainer);
  assert(containerWritable.length === 0, `No writable sections are marked as containers`);
}

// ---------------------------------------------------------------------------
// Test 2: Cross-Grammar Contamination Prevention
// ---------------------------------------------------------------------------

section('TEST 2: Cross-Grammar Contamination');

const rpGrammar = getGrammar('research_project');
const siwesGrammar = getGrammar('siwes_report');
const essayGrammar = getGrammar('essay');

// SIWES-only roles must not be valid in research_project
assert(!rpGrammar.validRoles.has('siwes_history'), 'siwes_history NOT valid in research_project');
assert(!rpGrammar.validRoles.has('company_profile'), 'company_profile NOT valid in research_project');
assert(!rpGrammar.validRoles.has('skills_acquired'), 'skills_acquired NOT valid in research_project');

// Research-only roles must not be valid in SIWES
assert(!siwesGrammar.validRoles.has('empirical_review'), 'empirical_review NOT valid in siwes_report');
assert(!siwesGrammar.validRoles.has('research_design'), 'research_design NOT valid in siwes_report');
assert(!siwesGrammar.validRoles.has('population_and_sampling'), 'population_and_sampling NOT valid in siwes_report');

// Essay roles must not be valid in research_project
assert(!rpGrammar.validRoles.has('thesis_statement'), 'thesis_statement NOT valid in research_project');
assert(!rpGrammar.validRoles.has('counterargument'), 'counterargument NOT valid in research_project');

// Research roles must not be valid in essay
assert(!essayGrammar.validRoles.has('empirical_review'), 'empirical_review NOT valid in essay');
assert(!essayGrammar.validRoles.has('methodology'), 'methodology NOT valid in essay');

// ---------------------------------------------------------------------------
// Test 3: Section Numbering
// ---------------------------------------------------------------------------

section('TEST 3: Section Numbering');

for (const grammar of allGrammars) {
  console.log(`\n  --- ${grammar.label} ---`);

  const numbered = computeNumbering(grammar.sections);
  const flat = flattenNumberedSections(numbered);

  // Print the full numbered structure
  for (const s of flat) {
    const indent = '    '.repeat(s.depth);
    const marker = s.node.isContainer ? '📁' : '📄';
    console.log(`${indent}${marker} ${s.displayText}`);
  }

  // Validate numbering
  const errors = validateNumbering(numbered);
  assert(errors.length === 0, `Numbering valid (${errors.length} errors)`);
  errors.forEach((e) => console.error(`    ⚠ ${e}`));

  // Check that chapter numbers are sequential
  const chapterNumbers = numbered
    .filter((n) => n.number && !n.number.includes('.'))
    .map((n) => parseInt(n.number, 10));
  
  for (let i = 1; i < chapterNumbers.length; i++) {
    assert(
      chapterNumbers[i] === chapterNumbers[i - 1] + 1,
      `Chapter ${chapterNumbers[i]} follows ${chapterNumbers[i - 1]}`,
    );
  }

  // Check number map
  const numberMap = buildNumberMap(numbered);
  assert(numberMap.size === flat.length, `Number map has ${numberMap.size} entries (expected ${flat.length})`);
}

// ---------------------------------------------------------------------------
// Test 4: Weighting Engine
// ---------------------------------------------------------------------------

section('TEST 4: Weighting Engine');

const testCases: Array<{ type: DocumentType; pages: number }> = [
  { type: 'research_project', pages: 30 },
  { type: 'siwes_report', pages: 15 },
  { type: 'term_paper', pages: 10 },
  { type: 'essay', pages: 5 },
];

for (const tc of testCases) {
  console.log(`\n  --- ${tc.type} (${tc.pages} pages) ---`);

  const grammar = getGrammar(tc.type);
  const budget = calculateWordBudgets(grammar, tc.pages);

  console.log(`  Total words: ${budget.totalWords}`);

  // Word budgets should sum to approximately total words
  const sumTargets = budget.slots.reduce((s, slot) => s + slot.target, 0);
  const tolerance = budget.totalWords * 0.05; // 5% tolerance for rounding
  assert(
    Math.abs(sumTargets - budget.totalWords) <= tolerance,
    `Slot targets sum (${sumTargets}) ≈ total (${budget.totalWords})`,
  );

  // Every slot should have min < target < max
  for (const slot of budget.slots) {
    assert(slot.min <= slot.target, `${slot.slotId}: min (${slot.min}) ≤ target (${slot.target})`);
    assert(slot.target <= slot.max, `${slot.slotId}: target (${slot.target}) ≤ max (${slot.max})`);
  }

  // Print top 5 by budget
  const sorted = [...budget.slots].sort((a, b) => b.target - a.target);
  console.log(`  Top 5 by word budget:`);
  for (const slot of sorted.slice(0, 5)) {
    console.log(`    ${slot.slotId} (${slot.role}): ${slot.target} words [${slot.min}-${slot.max}]`);
  }
}

// ---------------------------------------------------------------------------
// Test 5: Document Assembly with Dummy Text
// ---------------------------------------------------------------------------

section('TEST 5: Document Assembly');

{
  const grammar = getGrammar('research_project');
  const contentMap: ContentMap = new Map();

  // Fill writable sections with dummy text
  const writable = getWritableSections(grammar);
  for (const node of writable) {
    const dummyBlocks: Block[] = [
      {
        type: 'paragraph',
        text: `This is dummy content for the "${node.displayHeading}" section (role: ${node.role}). In a real document, this would contain substantive academic prose generated by the LLM and validated by all seven gates.`,
      },
      {
        type: 'paragraph',
        text: `The content here demonstrates that the grammar tree, numbering engine, and renderer work correctly together. No Markdown syntax, no heading numbers, no formatting — just plain text blocks.`,
      },
    ];
    contentMap.set(node.id, dummyBlocks);
  }

  const doc = assembleDocument(grammar, contentMap, 'Impact of Cloud-Native Microservices on Financial Security');

  assert(doc.documentType === 'research_project', `Document type is research_project`);
  assert(doc.sections.length > 0, `Document has ${doc.sections.length} sections`);

  // Check that numbered chapters appear correctly
  const ch1 = doc.sections.find((s) => s.nodeId === 'rp-ch1');
  assert(ch1 !== undefined, 'Chapter 1 (Introduction) found');
  assert(ch1!.heading.number === '1', `Chapter 1 number is "1" (got "${ch1!.heading.number}")`);

  const ch2 = doc.sections.find((s) => s.nodeId === 'rp-ch2');
  assert(ch2 !== undefined, 'Chapter 2 (Literature Review) found');
  assert(ch2!.heading.number === '2', `Chapter 2 number is "2" (got "${ch2!.heading.number}")`);

  // Check sub-section numbering
  const s21 = doc.sections.find((s) => s.nodeId === 'rp-ch2-s1');
  assert(s21 !== undefined, 'Section 2.1 (Conceptual Review) found');
  assert(s21!.heading.number === '2.1', `Section 2.1 number is "2.1" (got "${s21!.heading.number}")`);

  // Abstract should have no number
  const abstract = doc.sections.find((s) => s.nodeId === 'rp-abstract');
  assert(abstract !== undefined, 'Abstract found');
  assert(abstract!.heading.number === '', `Abstract has no number (got "${abstract!.heading.number}")`);

  // Check completeness
  const missing = findMissingRequiredSections(grammar, contentMap);
  assert(missing.length === 0, `All required sections filled (${missing.length} missing)`);

  // Check with empty content map
  const emptyMissing = findMissingRequiredSections(grammar, new Map());
  assert(emptyMissing.length > 0, `Empty doc has ${emptyMissing.length} missing required sections`);
}

// ---------------------------------------------------------------------------
// Test 6: Preview HTML Rendering
// ---------------------------------------------------------------------------

section('TEST 6: Preview HTML Rendering');

{
  const grammar = getGrammar('research_project');
  const contentMap: ContentMap = new Map();

  const writable = getWritableSections(grammar);
  for (const node of writable) {
    contentMap.set(node.id, [
      {
        type: 'paragraph',
        text: `Academic content for ${node.displayHeading}. This demonstrates that the preview renderer produces clean HTML without any Markdown syntax.`,
      },
    ]);
  }

  const doc = assembleDocument(grammar, contentMap, 'Test Document');
  const html = renderToPreviewHtml(doc);

  // Must NOT contain Markdown
  assert(!html.includes('# '), 'HTML contains no Markdown headings (#)');
  assert(!html.includes('**'), 'HTML contains no Markdown bold (**)');
  assert(!html.includes('__'), 'HTML contains no Markdown underline (__)');
  assert(!html.includes('```'), 'HTML contains no Markdown code blocks');

  // Must contain proper HTML elements
  assert(html.includes('<h1'), 'HTML contains <h1> elements');
  assert(html.includes('<h2'), 'HTML contains <h2> elements');
  assert(html.includes('<p'), 'HTML contains <p> elements');
  assert(html.includes('data-section-id'), 'HTML contains section ID attributes');

  // Must contain chapter numbers
  assert(html.includes('Chapter 1:'), 'HTML contains "Chapter 1:"');
  assert(html.includes('Chapter 2:'), 'HTML contains "Chapter 2:"');
  assert(html.includes('Chapter 5:'), 'HTML contains "Chapter 5:"');

  // Must contain section numbers
  assert(html.includes('2.1 '), 'HTML contains section number "2.1"');
  assert(html.includes('3.2 '), 'HTML contains section number "3.2"');

  console.log(`\n  📄 Preview HTML length: ${html.length} chars`);
  console.log(`  First 500 chars:\n${html.substring(0, 500)}`);
}

// ---------------------------------------------------------------------------
// Test 7: All Grammars Render Correctly
// ---------------------------------------------------------------------------

section('TEST 7: All Grammars Render');

for (const grammar of allGrammars) {
  console.log(`\n  --- ${grammar.label} ---`);

  const contentMap: ContentMap = new Map();
  const writable = getWritableSections(grammar);
  for (const node of writable) {
    contentMap.set(node.id, [
      { type: 'paragraph', text: `Dummy text for ${node.role}.` },
    ]);
  }

  const doc = assembleDocument(grammar, contentMap, `Test ${grammar.documentType}`);
  const html = renderToPreviewHtml(doc);

  assert(!html.includes('# '), `${grammar.documentType}: No Markdown headings`);
  assert(html.includes('<h1'), `${grammar.documentType}: Has HTML headings`);
  assert(!html.includes('undefined'), `${grammar.documentType}: No "undefined" in output`);
  assert(!html.includes('null'), `${grammar.documentType}: No "null" in output`);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

section('RESULTS');
console.log(`\n  Total: ${passCount + failCount} assertions`);
console.log(`  ✅ Passed: ${passCount}`);
console.log(`  ❌ Failed: ${failCount}`);

if (failCount > 0) {
  console.error(`\n  ⚠ ${failCount} test(s) failed!`);
  process.exit(1);
} else {
  console.log(`\n  🎉 All Phase 1 tests passed!`);
  process.exit(0);
}
