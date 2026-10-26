// src/lib/config.ts

// Document-specific pricing structure in Naira (₦):
// Term Paper: ₦1,500
// SIWES / IT Report: ₦6,000 (humanized generation included)
// Essay: ₦500
export const DOCUMENT_PRICES: Record<string, number> = {
  term_paper: 1500,
  siwes_report: 6000,
  essay: 500,
};

export const getDocumentPrice = (docType?: string): number => {
  if (!docType) return 6000;
  return DOCUMENT_PRICES[docType] ?? 6000;
};

// Default fallback price
export const REPORT_PRICE = 6000;

// The number of days a purchased report remains available for download.
export const REPORT_EXPIRATION_DAYS = 30;

// Document Page Count Standards & Constraints:
// - Term Paper: minimum 5 pages (default: 5 pages)
// - Essay: minimum 2 pages (default: 2 pages)
// - SIWES / IT Report: minimum 10 pages (default: 15 pages)
export interface DocumentPageLimits {
  min: number;
  default: number;
  max: number;
  label: string;
}

export const DOCUMENT_PAGE_LIMITS: Record<string, DocumentPageLimits> = {
  term_paper: { min: 5, default: 5, max: 30, label: 'Term Paper (Min 5 pages)' },
  essay: { min: 2, default: 2, max: 15, label: 'Academic Essay (Min 2 pages)' },
  siwes_report: { min: 10, default: 15, max: 50, label: 'SIWES / IT Report (Min 10 pages)' },
};

export const getDocumentPageLimits = (docType?: string): DocumentPageLimits => {
  if (!docType) return DOCUMENT_PAGE_LIMITS.term_paper;
  return DOCUMENT_PAGE_LIMITS[docType] ?? DOCUMENT_PAGE_LIMITS.term_paper;
};

export const getValidPageCount = (docType?: string, requested?: number): number => {
  const limits = getDocumentPageLimits(docType);
  if (!requested || isNaN(requested)) return limits.default;
  if (requested < limits.min) return limits.min;
  if (requested > limits.max) return limits.max;
  return Math.round(requested);
};

export interface PageBudgetBreakdown {
  targetPages: number;
  availableBodyPages: number;
  totalWordBudget: number;
  sectionWordBudgets: {
    abstractWords: number;
    skillsWords: number;
    chapterFourWords: number;
    chapterFiveWords: number;
  };
}

export const calculatePageBudget = (docType: string = 'term_paper', targetPagesInput?: number): PageBudgetBreakdown => {
  const targetPages = getValidPageCount(docType, targetPagesInput);

  if (docType === 'essay') {
    // 1 cover page (or header) + remaining body pages
    const availableBodyPages = Math.max(1, targetPages - 1);
    // Double spaced academic prose: ~240 words per page to ensure no overflow
    const totalWordBudget = Math.round(availableBodyPages * 240);
    return {
      targetPages,
      availableBodyPages,
      totalWordBudget,
      sectionWordBudgets: {
        abstractWords: 0,
        skillsWords: Math.round(totalWordBudget * 0.35), // Literature & Concepts (Sec 1 & 2)
        chapterFourWords: Math.round(totalWordBudget * 0.40), // Core Argumentation (Sec 3 & 4)
        chapterFiveWords: Math.round(totalWordBudget * 0.25), // Conclusion & Citations (Sec 5)
      },
    };
  }

  if (docType === 'term_paper') {
    // Cover page = 1 page
    // When targetPages < 8: prelims are compact (1 page total or inline abstract)
    // When targetPages >= 8: prelims have dedicated pages (Abstract, TOC = 2 pages)
    const prelimPages = targetPages >= 8 ? 3 : 1;
    const availableBodyPages = Math.max(2, targetPages - prelimPages);
    const totalWordBudget = Math.round(availableBodyPages * 240);
    return {
      targetPages,
      availableBodyPages,
      totalWordBudget,
      sectionWordBudgets: {
        abstractWords: Math.min(150, Math.round(totalWordBudget * 0.10)),
        skillsWords: Math.round(totalWordBudget * 0.35), // Literature review (Chap 2)
        chapterFourWords: Math.round(totalWordBudget * 0.35), // Methodology & Findings (Chap 3 & 4)
        chapterFiveWords: Math.round(totalWordBudget * 0.20), // Summary & Refs (Chap 5)
      },
    };
  }

  // SIWES Report:
  // Preliminaries (Cover, Ack, Abstract, TOC, LOF) = 5 pages
  const prelimPages = 5;
  const availableBodyPages = Math.max(5, targetPages - prelimPages);
  const textBodyPages = availableBodyPages;
  const totalWordBudget = Math.round(textBodyPages * 240);
  return {
    targetPages,
    availableBodyPages,
    totalWordBudget,
    sectionWordBudgets: {
      abstractWords: 150,
      skillsWords: Math.round(totalWordBudget * 0.40),
      chapterFourWords: Math.round(totalWordBudget * 0.35),
      chapterFiveWords: Math.round(totalWordBudget * 0.25),
    },
  };
};
