/**
 * @fileOverview HTML preview renderer for the Scholarverse UI.
 *
 * Converts a RenderedDocument into sanitized HTML for in-browser preview.
 * No Markdown is ever used — headings, paragraphs, and lists are rendered
 * as proper HTML elements with inline styles.
 *
 * This is NOT the DOCX renderer (that's in docx-renderer.ts).
 *
 * @module src/lib/generator/renderer/preview-renderer
 */

import { RenderedDocument, RenderedSection, Block } from './types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const HEADING_STYLES: Record<1 | 2 | 3, { tag: string; fontSize: string; marginTop: string }> = {
  1: { tag: 'h1', fontSize: '1.5rem', marginTop: '2.5rem' },
  2: { tag: 'h2', fontSize: '1.25rem', marginTop: '1.75rem' },
  3: { tag: 'h3', fontSize: '1.1rem', marginTop: '1.25rem' },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render a full RenderedDocument to an HTML string for preview.
 *
 * @param doc       The assembled RenderedDocument
 * @param options   Optional rendering preferences
 * @returns         Complete HTML string (no <html>/<body> wrapper — for embedding)
 */
export function renderToPreviewHtml(
  doc: RenderedDocument,
  options: PreviewOptions = {},
): string {
  const {
    fontFamily = 'Times New Roman, serif',
    fontSize = '12pt',
    lineHeight = '2',
    textAlign = 'left',
    showEmptySections = true,
  } = options;

  const parts: string[] = [];

  // Document title
  parts.push(
    `<div style="text-align: center; margin-bottom: 2rem;">`,
    `  <h1 style="font-family: ${fontFamily}; font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem 0;">${escapeHtml(doc.title)}</h1>`,
    `  <p style="font-family: ${fontFamily}; font-size: 0.875rem; color: #666; margin: 0;">${formatDocumentType(doc.documentType)}</p>`,
    `</div>`,
  );

  // Sections
  for (const section of doc.sections) {
    const sectionHtml = renderSection(section, {
      fontFamily,
      fontSize,
      lineHeight,
      textAlign,
      showEmptySections,
    });
    if (sectionHtml) {
      parts.push(sectionHtml);
    }
  }

  return parts.join('\n');
}

/**
 * Render a single section to HTML (useful for partial/live preview).
 */
export function renderSectionToHtml(
  section: RenderedSection,
  options: PreviewOptions = {},
): string {
  return renderSection(section, {
    fontFamily: options.fontFamily ?? 'Times New Roman, serif',
    fontSize: options.fontSize ?? '12pt',
    lineHeight: options.lineHeight ?? '2',
    textAlign: options.textAlign ?? 'left',
    showEmptySections: options.showEmptySections ?? true,
  });
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface PreviewOptions {
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'justify';
  /** If false, sections with no content blocks are hidden */
  showEmptySections?: boolean;
}

// ---------------------------------------------------------------------------
// Internal Rendering
// ---------------------------------------------------------------------------

function renderSection(
  section: RenderedSection,
  opts: Required<PreviewOptions>,
): string {
  const hasContent = section.blocks.length > 0;
  const isContainer = section.heading.isContainer;

  // Skip empty non-container sections if configured to hide them
  if (!hasContent && !isContainer && !opts.showEmptySections) {
    return '';
  }

  const parts: string[] = [];

  // Render heading
  const headingHtml = renderHeading(section.heading, opts.fontFamily);
  parts.push(headingHtml);

  // Render content blocks
  if (hasContent) {
    for (const block of section.blocks) {
      parts.push(renderBlock(block, opts));
    }
  } else if (!isContainer) {
    // Empty section placeholder
    parts.push(
      `<p style="font-family: ${opts.fontFamily}; font-size: ${opts.fontSize}; line-height: ${opts.lineHeight}; color: #999; font-style: italic; margin: 0.5rem 0;">` +
        `[Content pending — this section has not been generated yet]` +
        `</p>`,
    );
  }

  return `<div data-section-id="${escapeHtml(section.nodeId)}" style="margin-bottom: 1rem;">\n${parts.join('\n')}\n</div>`;
}

function renderHeading(
  heading: RenderedSection['heading'],
  fontFamily: string,
): string {
  const style = HEADING_STYLES[heading.level];

  // Build the display text: "Chapter 1: Introduction" or "2.3 Empirical Review"
  let displayText: string;
  if (heading.number) {
    if (heading.level === 1) {
      displayText = `Chapter ${heading.number}: ${heading.text}`;
    } else {
      displayText = `${heading.number} ${heading.text}`;
    }
  } else {
    displayText = heading.text;
  }

  return (
    `<${style.tag} style="font-family: ${fontFamily}; font-size: ${style.fontSize}; font-weight: 700; margin: ${style.marginTop} 0 0.75rem 0; padding: 0;">` +
    escapeHtml(displayText) +
    `</${style.tag}>`
  );
}

function renderBlock(
  block: Block,
  opts: Required<PreviewOptions>,
): string {
  const baseStyle = `font-family: ${opts.fontFamily}; font-size: ${opts.fontSize}; line-height: ${opts.lineHeight}; text-align: ${opts.textAlign}; margin: 0 0 0.75rem 0;`;

  switch (block.type) {
    case 'paragraph':
      return `<p style="${baseStyle}">${escapeHtml(block.text)}</p>`;

    case 'definition_list': {
      // Text format expected: "Term: Definition\nTerm: Definition"
      const items = block.text.split('\n').filter((line) => line.trim());
      const dlItems = items
        .map((item) => {
          const colonIdx = item.indexOf(':');
          if (colonIdx > 0) {
            const term = item.substring(0, colonIdx).trim();
            const def = item.substring(colonIdx + 1).trim();
            return `  <dt style="font-weight: 600; margin-top: 0.5rem;">${escapeHtml(term)}</dt>\n  <dd style="margin-left: 1.5rem; margin-bottom: 0.25rem;">${escapeHtml(def)}</dd>`;
          }
          return `  <dd style="margin-left: 1.5rem;">${escapeHtml(item)}</dd>`;
        })
        .join('\n');
      return `<dl style="${baseStyle}">\n${dlItems}\n</dl>`;
    }

    case 'enumerated_list': {
      // Text format expected: newline-separated items
      const items = block.text.split('\n').filter((line) => line.trim());
      const liItems = items
        .map((item) => `  <li style="margin-bottom: 0.25rem;">${escapeHtml(item)}</li>`)
        .join('\n');
      return `<ol style="${baseStyle} padding-left: 2rem;">\n${liItems}\n</ol>`;
    }

    default:
      return `<p style="${baseStyle}">${escapeHtml(block.text)}</p>`;
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDocumentType(type: string): string {
  const labels: Record<string, string> = {
    research_project: 'Research Project',
    siwes_report: 'SIWES / Industrial Training Report',
    term_paper: 'Term Paper',
    essay: 'Academic Essay',
  };
  return labels[type] ?? type;
}
