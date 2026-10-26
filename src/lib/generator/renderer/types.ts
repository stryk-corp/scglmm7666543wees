/**
 * @fileOverview Renderer type definitions.
 *
 * The renderer is the ONLY place formatting and numbering happen.
 * No Markdown anywhere in the pipeline.
 *
 * @module src/lib/generator/renderer/types
 */

import { DocumentType } from '../grammar/types';

// ---------------------------------------------------------------------------
// Block Types (shared with contracts — re-exported here for convenience)
// ---------------------------------------------------------------------------

export type BlockType = 'paragraph' | 'definition_list' | 'enumerated_list';

export interface Block {
  type: BlockType;
  text: string;
  sourceIds?: string[];
}

// ---------------------------------------------------------------------------
// Rendered Document Structure
// ---------------------------------------------------------------------------

export interface RenderedHeading {
  /** Computed from tree position: "1", "1.1", "2.3.1", or "" for unnumbered */
  number: string;

  /** From grammar displayHeading */
  text: string;

  /** 1 = chapter, 2 = section, 3 = subsection */
  level: 1 | 2 | 3;

  /** Is this a container heading (no content, only sub-sections) */
  isContainer: boolean;
}

export interface RenderedSection {
  /** Unique ID from the grammar node */
  nodeId: string;

  /** The formatted heading */
  heading: RenderedHeading;

  /** Approved content blocks (empty for containers) */
  blocks: Block[];
}

export interface RenderedDocument {
  title: string;
  documentType: DocumentType;
  sections: RenderedSection[];
}

// ---------------------------------------------------------------------------
// DOCX Export Options
// ---------------------------------------------------------------------------

export interface DocxOptions {
  fontFamily: string;
  fontSize: number;           // pt
  lineSpacing: number;        // e.g. 2.0
  margins: {
    top: number;              // inches
    right: number;
    bottom: number;
    left: number;
  };
  textAlign: 'left' | 'justify';
  pageNumberEnabled: boolean;
  pageNumberPosition: 'bottom-center' | 'bottom-left' | 'bottom-right';
}

export const DEFAULT_DOCX_OPTIONS: DocxOptions = {
  fontFamily: 'Times New Roman',
  fontSize: 12,
  lineSpacing: 2.0,
  margins: { top: 1, right: 1, bottom: 1, left: 1.5 },
  textAlign: 'left',
  pageNumberEnabled: true,
  pageNumberPosition: 'bottom-center',
};
