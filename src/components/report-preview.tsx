'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ReportData } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageSelector } from '@/components/image-selector';
import { cn } from '@/lib/utils';
import { useDebounce } from 'use-debounce';
import mermaid from 'mermaid';
import { CoverPage } from '@/components/cover-themes/cover-page';
import { calculatePageBudget, getValidPageCount } from '@/lib/config';
import { Check, Pencil } from 'lucide-react';

interface ReportPreviewProps {
  formData: ReportData;
  setFormData: Dispatch<SetStateAction<ReportData>>;
  isPurchased: boolean;
}

// A4/Letter-ish sheet width the layout is designed for (8.5in at 96dpi)
const SHEET_WIDTH_PX = 8.5 * 96;

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="preview-placeholder">{children}</span>
);

function normalizeDuplicateHeadingNumbers(line: string): string {
  const match = line.match(/^(#{1,6}\s+)(.*)$/);
  if (!match) return line;

  const tokens = match[2].split(/\s+/);
  const numberPattern = /^\d+(?:\.\d+)*$/;
  const numbers: string[] = [];
  while (tokens[numbers.length] && numberPattern.test(tokens[numbers.length])) {
    numbers.push(tokens[numbers.length]);
  }
  if (numbers.length < 2) return line;

  let chosenNumber = numbers[0];
  let consumed = 1;
  for (const number of numbers.slice(1)) {
    if (number === chosenNumber || number.startsWith(`${chosenNumber}.`)) {
      chosenNumber = number;
      consumed += 1;
    } else {
      break;
    }
  }

  if (consumed < 2) return line;
  return `${match[1]}${chosenNumber} ${tokens.slice(consumed).join(' ')}`.trimEnd();
}

const LockedContent = ({ isPurchased, children, placeholderText }: { isPurchased: boolean, children: React.ReactNode, placeholderText?: string }) => {
    if (isPurchased) {
        return <>{children}</>;
    }
    return (
        <div className="no-print-lock relative my-4 min-h-[8rem] overflow-hidden rounded-lg border border-border bg-muted/30">
            <div className="pointer-events-none select-none p-6 opacity-40 blur-[3px]" aria-hidden>
                {children || <p><Placeholder>{placeholderText || "Content will be generated here."}</Placeholder></p>}
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="max-w-[18rem] rounded-xl border border-border bg-background/90 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
                    <p className="font-serif text-base leading-snug text-foreground">Locked until you finalize</p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">This section is written when your report is generated.</p>
                </div>
            </div>
        </div>
    );
};

function formatPreviewText(text: string | undefined | null) {
  if (!text) return null;

  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  let html = text
    .split('\n')
    .map(line => {
      const trimmedLine = normalizeDuplicateHeadingNumbers(line.trim());

      // Headers
      if (trimmedLine.startsWith('##### ')) return `<h5 data-toc-ignore="true">${escapeHtml(trimmedLine.substring(6))}</h5>`;
      if (trimmedLine.startsWith('#### ')) return `<h4 data-toc-ignore="true">${escapeHtml(trimmedLine.substring(5))}</h4>`;
      if (trimmedLine.startsWith('### ')) return `<h3 data-toc-ignore="true">${escapeHtml(trimmedLine.substring(4))}</h3>`;
      if (trimmedLine.startsWith('## ')) return `<h2 data-toc-ignore="true">${escapeHtml(trimmedLine.substring(3))}</h2>`;
      
      // Lists
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ')) {
        const content = escapeHtml(trimmedLine.substring(2))
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<li class="ml-4 list-disc">${content}</li>`;
      }
      
      // Empty line
      if (trimmedLine === '') return '<br />';
      
      // Paragraph
      const pContent = escapeHtml(line)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<p>${pContent}</p>`;
    })
    .join('');

  // Wrap list items in <ul> tags
  html = html.replace(/(<li>.*?<\/li>)/g, (match, offset, fullString) => {
    const isFirstInList = offset === 0 || !fullString.substring(0, offset).endsWith('</li>');
    const isLastInList = (offset + match.length >= fullString.length) || !fullString.substring(offset + match.length).startsWith('<li>');
    
    let wrappedMatch = match;
    if (isFirstInList) wrappedMatch = '<ul>' + wrappedMatch;
    if (isLastInList) wrappedMatch = wrappedMatch + '</ul>';
    return wrappedMatch;
  });

  return { __html: html };
}


// Function to safely remove prefixes
const stripPrefix = (text: string, prefixes: string[]) => {
  const lowerText = text.toLowerCase();
  for (const prefix of prefixes) {
    if (lowerText.startsWith(prefix.toLowerCase())) {
      return text.substring(prefix.length).trim();
    }
  }
  return text;
};

export default function ReportPreview({ formData, setFormData, isPurchased }: ReportPreviewProps) {
  // --- Responsive sheet: on phones the reader can pick "Reading" (reflowed) or "Full page" (true layout, scaled to fit)
  const [mobilePreviewMode, setMobilePreviewMode] = useState<'reading' | 'sheet'>('reading');
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [scale, setScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const reading = isPhone && mobilePreviewMode === 'reading';

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || reading) {
      setScale(1);
      return;
    }
    const measure = () => setScale(Math.max(0.3, Math.min(1, frame.clientWidth / SHEET_WIDTH_PX)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [reading]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const ro = new ResizeObserver(([entry]) => setSheetHeight(entry.contentRect.height));
    ro.observe(sheet);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
  }, []);

  const cleanFacultyName = useMemo(() => stripPrefix(formData.facultyName, ['Faculty of']), [formData.facultyName]);
  const cleanDepartmentName = useMemo(() => stripPrefix(formData.departmentName, ['Department of', 'Dept of']), [formData.departmentName]);


  const previewData = {
    ...formData,
    facultyName: cleanFacultyName,
    departmentName: cleanDepartmentName,
    acknowledgementHtml: formatPreviewText(formData.acknowledgementText),
    abstractHtml: formatPreviewText(formData.abstractText),
    companyProfileHtml: formatPreviewText(formData.companyProfile),
    scopeOfSpecializationHtml: formatPreviewText(formData.scopeOfSpecialization),
    skillsChapterHtml: formatPreviewText(formData.skillsChapterText),
    challengesHtml: formatPreviewText(formData.challengesText),
    organogramAbbreviationsHtml: formatPreviewText(formData.organogramAbbreviations),
    conclusionHtml: formatPreviewText(formData.conclusionText),
    referencesHtml: formatPreviewText(formData.referencesText),

    // Chapter 4
    projectIntroHtml: formatPreviewText(formData.projectIntro),
    project1_introHtml: formatPreviewText(formData.project1_intro),
    project1_descHtml: formatPreviewText(formData.project1_desc),
    project1_welcomeScreenHtml: formatPreviewText(formData.project1_welcomeScreen),
    project1_signInScreenHtml: formatPreviewText(formData.project1_signInScreen),
    project1_validationHtml: formatPreviewText(formData.project1_validation),
    project1_signUpScreenHtml: formatPreviewText(formData.project1_signUpScreen),
    project1_homeScreenHtml: formatPreviewText(formData.project1_homeScreen),
    project1_toolsHtml: formatPreviewText(formData.project1_tools),
    project2_introHtml: formatPreviewText(formData.project2_intro),
    project2_descHtml: formatPreviewText(formData.project2_desc),
    project2_structureHtml: formatPreviewText(formData.project2_structure),
    project2_uiHtml: formatPreviewText(formData.project2_ui),
    project2_coreHtml: formatPreviewText(formData.project2_core),
    project2_toolsHtml: formatPreviewText(formData.project2_tools),
  };

  const hasCompanyProfileDetails = Boolean(
    formData.companyProfile?.trim() ||
    formData.ceoName?.trim() ||
    formData.attachmentLocation?.trim() ||
    formData.profileImages?.length
  );
  const hasCompanyScope = Boolean(formData.scopeOfSpecialization?.trim());
  const showCompanyProfile = !isPurchased || hasCompanyProfileDetails;
  const showCompanyScope = !isPurchased || hasCompanyScope;
  const showCompanyVision = !isPurchased || Boolean(formData.companyVision?.trim());
  const showCompanyMission = !isPurchased || Boolean(formData.companyMission?.trim());
  const showCompanyValues = !isPurchased || Boolean(formData.companyValues?.trim());
  const showOrganogram = !isPurchased || Boolean(formData.organogramAbbreviations?.trim() || formData.organogramImage?.length);
  const hasChapterTwoDetails = showCompanyVision || showCompanyMission || showCompanyValues || showOrganogram;
  const chapterTwoHeadingNumbers = {
    vision: 1,
    mission: 1 + Number(showCompanyVision),
    values: 1 + Number(showCompanyVision) + Number(showCompanyMission),
    organogram: 1 + Number(showCompanyVision) + Number(showCompanyMission) + Number(showCompanyValues),
  };
  const companyProfileHeadingNumber = 4;
  const companyScopeHeadingNumber = companyProfileHeadingNumber + Number(showCompanyProfile);
  
  const handleAttachmentImagesChange = (images: string[]) => {
    setFormData(prev => ({...prev, attachmentImages: images}));
  };

  const handleAttachmentCaptionChange = (caption: string) => {
    setFormData(prev => ({ ...prev, attachmentCaption: caption }));
  };

  const handleProfileImagesChange = (images: string[]) => {
    setFormData(prev => ({...prev, profileImages: images}));
  };

  const handleProfileCaptionChange = (caption: string) => {
    setFormData(prev => ({ ...prev, profileCaption: caption }));
  };
  
  const handleOrganogramImageChange = (images: string[]) => {
    setFormData(prev => ({...prev, organogramImage: images}));
  };

  const handleOrganogramCaptionChange = (caption: string) => {
    setFormData(prev => ({ ...prev, organogramCaption: caption }));
  };

  // Chapter 4 handlers
  const createHandler = <K extends keyof ReportData>(key: K) => (value: ReportData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  const handleProject1UseCaseDiagramChange = createHandler('project1_useCaseDiagram');
  const handleProject1UseCaseCaptionChange = createHandler('project1_useCaseCaption');
  const handleProject1WelcomeScreenImagesChange = createHandler('project1_welcomeScreenImages');
  const handleProject1WelcomeScreenCaptionChange = createHandler('project1_welcomeScreenCaption');
  const handleProject1SignInImagesChange = createHandler('project1_signInImages');
  const handleProject1SignInCaptionChange = createHandler('project1_signInCaption');
  const handleProject1SignUpImagesChange = createHandler('project1_signUpImages');
  const handleProject1SignUpCaptionChange = createHandler('project1_signUpCaption');
  const handleProject1HomeScreenImagesChange = createHandler('project1_homeScreenImages');
  const handleProject1HomeScreenCaptionChange = createHandler('project1_homeScreenCaption');
  const handleProject2CodeSnippetImagesChange = createHandler('project2_codeSnippetImages');
  const handleProject2CodeSnippetCaptionChange = createHandler('project2_codeSnippetCaption');


  const figures = useMemo(() => [
    { images: previewData.attachmentImages, prefix: "1.1", caption: previewData.attachmentCaption },
    { images: previewData.profileImages, prefix: "1.2", caption: previewData.profileCaption },
    { images: previewData.organogramImage, prefix: "2.1", caption: previewData.organogramCaption },
    { images: previewData.project1_useCaseDiagram, prefix: "4.1.1", caption: previewData.project1_useCaseCaption },
    { images: previewData.project1_welcomeScreenImages, prefix: "4.1.2", caption: previewData.project1_welcomeScreenCaption },
    { images: previewData.project1_signInImages, prefix: "4.1.3", caption: previewData.project1_signInCaption },
    { images: previewData.project1_signUpImages, prefix: "4.1.4", caption: previewData.project1_signUpCaption },
    { images: previewData.project1_homeScreenImages, prefix: "4.1.5", caption: previewData.project1_homeScreenCaption },
    { images: previewData.project2_codeSnippetImages, prefix: "4.1.6", caption: previewData.project2_codeSnippetCaption },
  ].filter(fig => fig.images.length > 0), [previewData]);


  const [tocEntries, setTocEntries] = useState<Array<{ id: string; label: string; level: number }>>([]);
  const [tocPages, setTocPages] = useState<Record<string, number>>({});
  const [debouncedFormData] = useDebounce(formData, 300);

  const scanToc = useCallback(() => {
    const preview = document.getElementById('preview-content');
    if (!preview) return;

    const nodes = Array.from(
      preview.querySelectorAll('h2:not([data-toc-ignore]), h3:not([data-toc-ignore]), h4:not([data-toc-ignore])'),
    ) as HTMLElement[];
    const entries: Array<{ id: string; label: string; level: number }> = [];
    const usedIds = new Set<string>();

    nodes.forEach((node, index) => {
      if (node.closest('#toc-page') || node.closest('#cover-page')) return;
      
      const text = (node.textContent || '').trim();
      if (!text) return;

      let slug = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      if (!slug) slug = `heading-${index}`;
      
      let uniqueId = slug;
      let k = 1;
      while (usedIds.has(uniqueId) || document.getElementById(uniqueId)) {
        uniqueId = `${slug}-${k++}`;
      }
      usedIds.add(uniqueId);
      node.id = uniqueId;

      const level = node.tagName.toLowerCase() === 'h2' ? 2 : node.tagName.toLowerCase() === 'h3' ? 3 : 4;
      entries.push({ id: uniqueId, label: text, level });
    });

    setTocEntries(entries);
  }, []);

  const computeTocPages = useCallback(() => {
    const preview = document.getElementById('preview-content');
    if (!preview || tocEntries.length === 0) return;

    const convertToPixels = (value: string, dpi: number): number => {
      const num = parseFloat(value);
      if (value.endsWith('in')) return num * dpi;
      if (value.endsWith('cm')) return (num / 2.54) * dpi;
      if (value.endsWith('pt')) return (num / 72) * dpi;
      return num; // Assume px if no unit
    };

    const dpi = 96; // Standard screen DPI
    const pageHeightIn = 11;
    const marginTopPx = convertToPixels(formData.marginTop, dpi);
    const marginBottomPx = convertToPixels(formData.marginBottom, dpi);
    const pageHeightPx = pageHeightIn * dpi;
    const printableHeightPx = pageHeightPx - marginTopPx - marginBottomPx;
    
    // Safety check for printable height
    if (printableHeightPx <= 0) return;

    const newPageMap: Record<string, number> = {};

    // Page 1 starts at Chapter 1. Both rects are scaled equally when the sheet is
    // scaled to fit, so dividing the difference by the scale gives true layout pixels.
    const chapterEl = document.getElementById('chapter-1-page');
    const chapterTop = chapterEl ? chapterEl.getBoundingClientRect().top : preview.getBoundingClientRect().top;

    tocEntries.forEach((entry) => {
      const el = document.getElementById(entry.id);
      if (!el) return;

      const elementOffsetInContent = (el.getBoundingClientRect().top - chapterTop) / scale;

      if (elementOffsetInContent >= 0) {
        const pageNumber = Math.floor(elementOffsetInContent / printableHeightPx) + 1;
        newPageMap[entry.id] = pageNumber;
      }
    });
    
    setTocPages(newPageMap);
  }, [tocEntries, formData.marginTop, formData.marginBottom, scale]);


  useEffect(() => {
    scanToc();
  }, [debouncedFormData, scanToc]);
  
  useEffect(() => {
    if(tocEntries.length > 0) {
        // Debounce the page computation as well
        const timer = setTimeout(() => {
            computeTocPages();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [tocEntries, computeTocPages]);

  useEffect(() => {
    window.addEventListener('resize', computeTocPages);
    window.addEventListener('beforeprint', computeTocPages);
    return () => {
      window.removeEventListener('resize', computeTocPages);
      window.removeEventListener('beforeprint', computeTocPages);
    };
  }, [computeTocPages]);


  const fontStyles: React.CSSProperties = {
    fontFamily: `"${previewData.fontFamily}", sans-serif`,
    fontSize: previewData.fontSize,
    lineHeight: previewData.lineHeight,
  };

    const printStyles = useMemo(() => {
    let pageNumberContent = 'none';
    if (formData.pageNumberEnabled) {
      let pageCounterStyle: string;
      let pageFormat = formData.pageNumberFormat;

      switch(pageFormat) {
        case '{page_roman_lower}':
        case 'Page {page_roman_lower}':
          pageCounterStyle = 'lower-roman';
          break;
        case '{page_roman_upper}':
        case 'Page {page_roman_upper}':
          pageCounterStyle = 'upper-roman';
          break;
        default:
          pageCounterStyle = 'decimal';
      }

      const counter = `counter(page, ${pageCounterStyle})`;

      if (pageFormat.startsWith('Page ')) {
        pageNumberContent = `'Page ' ${counter}`;
      } else {
        pageNumberContent = counter;
      }
    }

    return `
      @page :first {
        @bottom-left { content: none; }
        @bottom-center { content: none; }
        @bottom-right { content: none; }
      }
      @page {
        @bottom-left { content: ${formData.pageNumberPosition === 'bottom-left' ? pageNumberContent : 'none'}; }
        @bottom-center { content: ${formData.pageNumberPosition === 'bottom-center' ? pageNumberContent : 'none'}; }
        @bottom-right { content: ${formData.pageNumberPosition === 'bottom-right' ? pageNumberContent : 'none'}; }
      }
    `;
  }, [formData]);

  const docType = previewData.documentType || 'siwes_report';
  const targetPageCount = getValidPageCount(docType, previewData.targetPageCount);
  const pageBudget = useMemo(() => calculatePageBudget(docType, targetPageCount), [docType, targetPageCount]);
  const isFullChapterBreaks = docType === 'siwes_report' || (docType === 'term_paper' && targetPageCount >= 8);
  const chapterBreakClass = isFullChapterBreaks ? "page-break" : "term-paper-section my-6 pt-3 border-t border-border/30";
  const docLabel = docType === 'term_paper' ? 'Academic term paper' : docType === 'essay' ? 'Academic essay' : 'SIWES defense report';

  const isScaled = !reading && scale < 1;

  return (
    <div className="relative">
      <style>{printStyles}</style>

      {/* Quiet status row: plain text, no boxes or icons */}
      <div className="print:hidden no-print mx-auto mb-4 flex w-full max-w-[8.5in] flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">{targetPageCount} pages</span>
          <span className="mx-1.5" aria-hidden>·</span>
          {docLabel}
        </p>
        <div className="flex items-center gap-3">
          <p className="tabular-nums">
            About {pageBudget.totalWordBudget.toLocaleString()} words
            <span className="hidden sm:inline"> · strict page limit</span>
          </p>
          {isPhone && (
            <div role="group" aria-label="Preview layout" className="inline-flex rounded-full border border-border bg-background p-0.5">
              {([
                { id: 'reading', label: 'Reading' },
                { id: 'sheet', label: 'Full page' },
              ] as const).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={mobilePreviewMode === id}
                  onClick={() => setMobilePreviewMode(id)}
                  className={cn(
                    'h-7 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    mobilePreviewMode === id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="print:hidden no-print mx-auto mb-3 flex w-full max-w-[8.5in] justify-end">
        <button
          type="button"
          aria-expanded={isEditingCover}
          onClick={() => setIsEditingCover((open) => !open)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isEditingCover ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {isEditingCover ? 'Done editing cover' : 'Edit cover details'}
        </button>
      </div>

      {isEditingCover && (
        <section
          aria-label="Edit cover details"
          className="print:hidden no-print mx-auto mb-4 grid w-full max-w-[8.5in] grid-cols-1 gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"
        >
          <p className="text-sm font-medium text-foreground sm:col-span-2">
            Edit these details here; the cover preview updates as you type.
          </p>
          {([
            ['fullName', 'Student name'],
            ['regNumber', 'Registration number'],
            ['universityName', 'University / institution'],
            ['facultyName', 'Faculty'],
            ['departmentName', 'Department'],
            ['courseCode', 'Course code & title'],
            ['supervisorNames', docType === 'term_paper' ? "Lecturer's name" : 'Supervisor'],
            ['reportTitle', docType === 'siwes_report' ? 'Training focus / report title' : 'Topic / title'],
            ...(docType === 'siwes_report' ? [['placeOfAttachment', 'Company / place of attachment'] as const] : []),
            ['reportMonth', 'Month'],
            ['reportYear', 'Year'],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`preview-cover-${key}`} className="text-xs text-muted-foreground">
                {label}
              </Label>
              <Input
                id={`preview-cover-${key}`}
                value={formData[key] || ''}
                onChange={(event) => setFormData((previous) => ({ ...previous, [key]: event.target.value }))}
                className="h-9 text-sm"
              />
            </div>
          ))}
        </section>
      )}

      {/* Frame measures the space available; the sheet inside is scaled down to fit when the space is narrower than the page */}
      <div
        ref={frameRef}
        className="sv-scale-outer w-full"
        style={isScaled && sheetHeight ? { height: sheetHeight * scale } : undefined}
      >
        <div
          ref={sheetRef}
          className="sv-scale-inner mx-auto"
          style={{
            width: reading ? '100%' : '8.5in',
            maxWidth: reading ? '8.5in' : undefined,
            transform: isScaled ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
          }}
        >
        <Card
          id="preview-content"
          style={{
            ...fontStyles,
            ['--user-margin-top' as any]: formData.marginTop || '1in',
            ['--user-margin-right' as any]: formData.marginRight || '1in',
            ['--user-margin-bottom' as any]: formData.marginBottom || '1in',
            ['--user-margin-left' as any]: formData.marginLeft || '1.25in',
          }}
          className={cn(
            "unselectable mx-auto w-full overflow-hidden rounded-md border border-border/60 text-foreground break-words hyphens-auto",
            "shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_-12px_rgba(0,0,0,0.14)]",
            reading ? 'sv-reading' : 'sv-sheet min-h-[11in]',
            {
              'text-left': previewData.textAlign === 'left',
              'text-center': previewData.textAlign === 'center',
              'text-justify': previewData.textAlign === 'justify',
            }
          )}
        >
      <div 
        id="report-body-container"
        className="report-content-wrapper"
      >

      {/* Dynamic Cover Page with 12 Themes */}
      <CoverPage formData={formData} />

      {/* Preliminaries: Only for SIWES & large Term Papers (Never for Essays) */}
      {docType !== 'essay' && (
        <>
          {/* Acknowledgement: only in SIWES or Term Papers with >= 8 pages */}
          {(docType === 'siwes_report' || targetPageCount >= 8) && (
            <div id="acknowledgement-page" className="page-break">
              <h2>ACKNOWLEDGEMENT</h2>
              <LockedContent isPurchased={isPurchased} placeholderText="This section will be automatically generated.">
                  {previewData.acknowledgementHtml ? <div dangerouslySetInnerHTML={previewData.acknowledgementHtml}></div> : <p>The acknowledgement text will appear here after generation.</p>}
              </LockedContent>
            </div>
          )}

          {/* Abstract */}
          <div id="abstract-page" className={cn(isFullChapterBreaks ? "page-break" : "term-paper-section my-6 pt-3")}>
            <h2>ABSTRACT</h2>
            <LockedContent isPurchased={isPurchased} placeholderText="This section will be automatically generated.">
                {previewData.abstractHtml ? <div dangerouslySetInnerHTML={previewData.abstractHtml}></div> : <p>The abstract will appear here after generation.</p>}
            </LockedContent>
          </div>

          {/* Table of Contents: for SIWES or Term Papers with >= 8 pages */}
          {(docType === 'siwes_report' || targetPageCount >= 8) && (
            <div id="toc-page" className="text-left page-break">
              <h2>TABLE OF CONTENTS</h2>
              <div className="toc-list">
                {tocEntries.length > 0 ? tocEntries.map((entry) => (
                  <a key={entry.id} href={`#${entry.id}`} className="toc-link block no-underline text-current p-1">
                    <div className="toc-entry text-sm leading-relaxed" data-level={entry.level}>
                      <div className="toc-label">{entry.label}</div>
                      <div className="toc-leader" aria-hidden />
                      <div className="toc-page">{tocPages[entry.id] ?? ''}</div>
                    </div>
                  </a>
                )) : <p><Placeholder>Table of Contents will be generated here.</Placeholder></p>}
              </div>
            </div>
          )}
          
          {/* List of Figures */}
          {(docType === 'siwes_report' && figures.length > 0) && (
            <div id="lof-page" className="page-break">
              <h2>LIST OF FIGURES</h2>
              <div className="prose prose-sm">
                {figures.length > 0 ? (
                  figures.map((fig, index) => (
                    <p key={index} className="text-sm leading-relaxed">
                      Figure {fig.prefix}: {fig.caption}
                    </p>
                  ))
                ) : (
                  <p><Placeholder>Figures will be listed here as you add them to the report.</Placeholder></p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* 1. TERM PAPER CHAPTERS                                   */}
      {/* ======================================================== */}
      {previewData.documentType === 'term_paper' ? (
        <>
          {/* Chapter 1: Introduction */}
          <div id="chapter-1-page" className={cn(isFullChapterBreaks ? "page-break" : "term-paper-section my-6 pt-3")}>
            <h2>CHAPTER 1: INTRODUCTION</h2>
            <h3>1.1 Background of the Study</h3>
            <p>
              In contemporary scholarly inquiry, understanding the structural dynamics of{' '}
              <strong>{formData.reportTitle || formData.fieldOfStudy || 'the investigated domain'}</strong> represents an essential academic priority. Rapid socio-technical transformations continue to reshape institutional practices, necessitating a comprehensive examination of empirical paradigms and theoretical models.
            </p>
            <h3>1.2 Statement of the Problem</h3>
            <p>
              {formData.thesisStatement || (
                <Placeholder>
                  Enter the core problem statement in Step 3. The problem statement defines the focal research challenge addressed in this paper.
                </Placeholder>
              )}
            </p>
            <h3>1.3 Research Objectives &amp; Questions</h3>
            {formData.researchQuestions ? (
              <div className="whitespace-pre-line leading-relaxed">
                {formData.researchQuestions}
              </div>
            ) : (
              <p>
                <Placeholder>
                  Research objectives and guiding research questions will appear here (configured in Step 3).
                </Placeholder>
              </p>
            )}
            <h3>1.4 Significance and Scope of the Study</h3>
            <p>
              This investigation provides valuable insights for scholars, institutional policymakers, and practitioners seeking evidence-based frameworks. The thematic scope centers on {formData.fieldOfStudy || 'relevant disciplinary domains'}, establishing actionable findings within {formData.universityName || 'the academic community'}.
            </p>
          </div>

          {/* Chapter 2: Literature Review */}
          <div id="chapter-2-page" className={cn(chapterBreakClass)}>
            <LockedContent isPurchased={isPurchased}>
              <h2>CHAPTER 2: LITERATURE REVIEW</h2>
              <h3>2.1 Conceptual Review</h3>
              {previewData.skillsChapterHtml ? (
                <div dangerouslySetInnerHTML={previewData.skillsChapterHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Conceptual literature review synthesizing primary concepts and definitions will appear here after AI synthesis.
                  </Placeholder>
                </p>
              )}
              <h3>2.2 Theoretical Framework</h3>
              <p>
                {formData.theoreticalFramework ? (
                  <>The conceptual architecture of this study is grounded in <strong>{formData.theoreticalFramework}</strong>, providing the foundational analytical lens through which variables and hypotheses are contextualized.</>
                ) : (
                  <Placeholder>
                    Theoretical framework (e.g. Technology Acceptance Model, Structural Functionalism) can be specified in Step 3.
                  </Placeholder>
                )}
              </p>
              <h3>2.3 Empirical Literature Review</h3>
              {previewData.projectIntroHtml ? (
                <div dangerouslySetInnerHTML={previewData.projectIntroHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Critical synthesis of prior empirical findings and peer-reviewed studies will be generated here in Step 5.
                  </Placeholder>
                </p>
              )}
            </LockedContent>
          </div>

          {/* Chapter 3: Research Methodology */}
          <div id="chapter-3-page" className={cn(chapterBreakClass)}>
            <LockedContent isPurchased={isPurchased}>
              <h2>CHAPTER 3: RESEARCH METHODOLOGY</h2>
              <h3>3.1 Research Design</h3>
              <p>
                This study adopts a <strong>{formData.methodologyType || 'Systematic Analytical & Qualitative Design'}</strong> to evaluate thematic phenomena with methodological rigor and objective replicability.
              </p>
              <h3>3.2 Data Sources &amp; Instrumentation</h3>
              <p>
                Primary analytical evidence was collated using {formData.technologiesUsed || 'indexed journal repositories, peer-reviewed monographs, and academic archives'}. Data triangulation was deployed to substantiate cross-source validity.
              </p>
              <h3>3.3 Method of Data Analysis</h3>
              <p>
                Analytical evaluation utilizes <strong>{formData.primarySkill || 'Thematic Content Synthesis and Critical Discourse Analysis'}</strong>, facilitating granular examination of key variables.
              </p>
              <h3>3.4 Methodological Limitations</h3>
              <p>
                {formData.challengesText || 'While rigorous verification was maintained, potential sample boundary conditions and scope delimitations are acknowledged.'}
              </p>
            </LockedContent>
          </div>

          {/* Chapter 4: Data Presentation & Discussion */}
          <div id="chapter-4-page" className={cn(chapterBreakClass)}>
            <LockedContent isPurchased={isPurchased}>
              <h2>CHAPTER 4: DATA PRESENTATION, THEMATIC ANALYSIS &amp; DISCUSSION</h2>
              <h3>4.1 Thematic Overview &amp; Findings</h3>
              {previewData.project1_descHtml ? (
                <div dangerouslySetInnerHTML={previewData.project1_descHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Thematic data presentation and analytical synthesis will be generated here in Step 5.
                  </Placeholder>
                </p>
              )}
              <h3>4.2 Scholarly Discussion &amp; Theoretical Implications</h3>
              {previewData.project2_descHtml ? (
                <div dangerouslySetInnerHTML={previewData.project2_descHtml} />
              ) : previewData.project1_welcomeScreenHtml ? (
                <div dangerouslySetInnerHTML={previewData.project1_welcomeScreenHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Detailed scholarly discussion evaluating the research objectives against literature evidence.
                  </Placeholder>
                </p>
              )}
            </LockedContent>
          </div>

          {/* Chapter 5: Summary, Conclusion & Recommendations */}
          <div id="chapter-5-page" className={cn(chapterBreakClass)}>
            <LockedContent isPurchased={isPurchased}>
              <h2>CHAPTER 5: SUMMARY, CONCLUSION &amp; RECOMMENDATIONS</h2>
              <h3>5.1 Summary of Findings</h3>
              {previewData.conclusionHtml ? (
                <div dangerouslySetInnerHTML={previewData.conclusionHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Executive summary of research findings generated after AI synthesis.
                  </Placeholder>
                </p>
              )}
              <h3>5.2 Scholarly Conclusion</h3>
              <p>
                The empirical findings affirm the critical propositions posited at the outset of this investigation, demonstrating the imperative for sustained scholarly inquiry.
              </p>
              <h3>5.3 Policy &amp; Practical Recommendations</h3>
              {previewData.challengesHtml ? (
                <div dangerouslySetInnerHTML={previewData.challengesHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Actionable recommendations and policy directions will appear here.
                  </Placeholder>
                </p>
              )}
            </LockedContent>
          </div>
        </>
      ) : previewData.documentType === 'essay' ? (
        /* ======================================================== */
        /* 2. ACADEMIC ESSAY SECTIONS                               */
        /* ======================================================== */
        <>
          {/* Section 1: Introduction & Central Thesis */}
          <div id="chapter-1-page" className="essay-section my-6 pt-2">
            <h2>SECTION 1: INTRODUCTION &amp; THESIS STATEMENT</h2>
            <h3>1.1 Contextual Backdrop</h3>
            <p>
              The ongoing academic debate concerning <strong>{formData.reportTitle || 'the examined topic'}</strong> requires rigorous philosophical examination. Contemporary paradigms present conflicting interpretations that challenge long-held theoretical assumptions.
            </p>
            <h3>1.2 Central Thesis Statement</h3>
            <div className="p-4 my-3 rounded-lg border-l-4 border-primary bg-muted/40 italic font-serif text-sm">
              &ldquo;{formData.thesisStatement || <Placeholder>Enter your central thesis statement in Step 3. The thesis is the core argument that unifies the essay.</Placeholder>}&rdquo;
            </div>
            <h3>1.3 Analytical Roadmap</h3>
            <p>
              This critique advances through four key analytical stages: contextual theoretical grounding, empirical evidence synthesis, critical examination of counterarguments, and a unified normative conclusion.
            </p>
          </div>

          {/* Section 2: Theoretical Foundations */}
          <div id="chapter-2-page" className="essay-section my-6 pt-3 border-t border-border/30">
            <LockedContent isPurchased={isPurchased}>
              <h2>SECTION 2: THEORETICAL FOUNDATIONS &amp; CLAIMS</h2>
              <h3>2.1 Foundational Literature</h3>
              {previewData.skillsChapterHtml ? (
                <div dangerouslySetInnerHTML={previewData.skillsChapterHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Theoretical foundations and conceptual claims will be synthesized here.
                  </Placeholder>
                </p>
              )}
              <h3>2.2 Conceptual Framework</h3>
              <p>
                {formData.theoreticalFramework ? (
                  <>Rooted in <strong>{formData.theoreticalFramework}</strong>, the arguments presented interrogate prevailing assumptions through dialectical analysis.</>
                ) : (
                  <Placeholder>
                    Specify an underlying theoretical paradigm in Step 3.
                  </Placeholder>
                )}
              </p>
            </LockedContent>
          </div>

          {/* Section 3: Primary Argumentation & Evidence */}
          <div id="chapter-3-page" className="essay-section my-6 pt-3 border-t border-border/30">
            <LockedContent isPurchased={isPurchased}>
              <h2>SECTION 3: PRIMARY ARGUMENTATION &amp; CASE EVIDENCE</h2>
              <h3>3.1 Critical Examination</h3>
              {previewData.projectIntroHtml ? (
                <div dangerouslySetInnerHTML={previewData.projectIntroHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Core argumentative discourse synthesized by AI in Step 5.
                  </Placeholder>
                </p>
              )}
              <h3>3.2 Empirical &amp; Historical Evidence</h3>
              {previewData.project1_descHtml ? (
                <div dangerouslySetInnerHTML={previewData.project1_descHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Detailed evidence, citations, and analytical case studies.
                  </Placeholder>
                </p>
              )}
            </LockedContent>
          </div>

          {/* Section 4: Counterarguments & Rebuttal */}
          <div id="chapter-4-page" className="essay-section my-6 pt-3 border-t border-border/30">
            <LockedContent isPurchased={isPurchased}>
              <h2>SECTION 4: COUNTERARGUMENTS &amp; CRITICAL REBUTTAL</h2>
              <h3>4.1 Opposing Perspectives</h3>
              <p>
                {formData.challengesText || (
                  <Placeholder>
                    Anticipated counterarguments and alternative theoretical perspectives configured in Step 4.
                  </Placeholder>
                )}
              </p>
              <h3>4.2 Dialectical Rebuttal &amp; Synthesis</h3>
              {previewData.conclusionHtml ? (
                <div dangerouslySetInnerHTML={previewData.conclusionHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Scholarly rebuttal addressing opposing views and reaffirming the central thesis.
                  </Placeholder>
                </p>
              )}
            </LockedContent>
          </div>

          {/* Section 5: Conclusion & Broader Implications */}
          <div id="chapter-5-page" className="essay-section my-6 pt-3 border-t border-border/30">
            <LockedContent isPurchased={isPurchased}>
              <h2>SECTION 5: CONCLUSION &amp; BROADER IMPLICATIONS</h2>
              <h3>5.1 Synthesis of Central Thesis</h3>
              <p>
                Having critically appraised the empirical record and interrogated counter-claims, the central thesis stands vindicated.
              </p>
              <h3>5.2 Broader Academic Implications</h3>
              {previewData.conclusionHtml ? (
                <div dangerouslySetInnerHTML={previewData.conclusionHtml} />
              ) : (
                <p>
                  <Placeholder>
                    Final scholarly judgment and broader implications for research and policy.
                  </Placeholder>
                </p>
              )}
            </LockedContent>
          </div>
        </>
      ) : (
        /* ======================================================== */
        /* 3. SIWES REPORT CHAPTERS (DEFAULT)                       */
        /* ======================================================== */
        <>
          {/* Chapter 1 */}
          <div id="chapter-1-page" className="page-break">
            <h2>CHAPTER 1: INTRODUCTION</h2>
            <h3>1.1 Brief History of SIWES</h3>
            <p>The Students Industrial Work Experience Scheme (SIWES) is a skills training program designed to equip students from universities, polytechnics, and other higher institutions with practical industry experience. It provides hands-on exposure to equipment and machinery that are often unavailable in academic institutions.</p>
            <h3>1.2 Objectives of SIWES</h3>
            <p>SIWES aims to bridge the gap between theory and practice, provide students with an opportunity to apply their knowledge in real-world situations, and expose them to work methods and techniques in handling equipment and machinery that may not be available in their institutions.</p>
            <h3>1.3 PLACE OF ATTACHMENT</h3>
            <p>My Industrial Training was undertaken at <strong>{previewData.placeOfAttachment || <Placeholder>Place of Attachment</Placeholder>}</strong>.</p>
            <div className="keep-together">
              <ImageSelector
                images={previewData.attachmentImages}
                caption={previewData.attachmentCaption}
                onImagesChange={handleAttachmentImagesChange}
                onCaptionChange={handleAttachmentCaptionChange}
                maxImages={3}
                figurePrefix="1.1"
              />
            </div>
            <LockedContent isPurchased={isPurchased}>
              {showCompanyProfile && (
                <>
                <h3>1.{companyProfileHeadingNumber} BRIEF PROFILE OF PLACE OF ATTACHMENT</h3>
                {previewData.companyProfileHtml ? (
                  <div dangerouslySetInnerHTML={previewData.companyProfileHtml}></div>
                ) : !isPurchased ? (
                  <p><Placeholder>Company profile will appear here.</Placeholder></p>
                ) : null}
                {(previewData.ceoName || previewData.attachmentLocation) && (
                  <p>
                    {previewData.ceoName && <>The organization is led by <strong>{previewData.ceoName}</strong>. </>}
                    {previewData.attachmentLocation && <>It is located at <strong>{previewData.attachmentLocation}</strong>.</>}
                  </p>
                )}
                <div className="keep-together">
                <ImageSelector
                    images={previewData.profileImages}
                    caption={previewData.profileCaption}
                    onImagesChange={handleProfileImagesChange}
                    onCaptionChange={handleProfileCaptionChange}
                    maxImages={3}
                    figurePrefix="1.2"
                />
                </div>
                {showCompanyScope && (
                  <>
                <h3>1.{companyScopeHeadingNumber} SCOPE OF SPECIALIZATION</h3>
                {previewData.scopeOfSpecializationHtml ? <div className="prose" dangerouslySetInnerHTML={previewData.scopeOfSpecializationHtml}></div> : <p><Placeholder>Company services will appear here.</Placeholder></p>}
                  </>
                )}
                </>
              )}
            </LockedContent>
          </div>

          {/* Chapter 2 */}
          {(!isPurchased || hasChapterTwoDetails) && (
          <div id="chapter-2-page" className="page-break">
            <LockedContent isPurchased={isPurchased}>
                <h2>CHAPTER 2: ORGANIZATIONAL STRUCTURE OF PLACEMENT OF ATTACHMENT</h2>
                {showCompanyVision && (
                  <>
                    <h3>2.{chapterTwoHeadingNumbers.vision} VISION:</h3>
                    <p>{previewData.companyVision || <Placeholder>Enter company vision in Step 3.</Placeholder>}</p>
                  </>
                )}
                {showCompanyMission && (
                  <>
                    <h3>2.{chapterTwoHeadingNumbers.mission} MISSION:</h3>
                    <p>{previewData.companyMission || <Placeholder>Enter company mission in Step 3.</Placeholder>}</p>
                  </>
                )}
                {showCompanyValues && (
                  <>
                    <h3>2.{chapterTwoHeadingNumbers.values} VALUE:</h3>
                    <p>{previewData.companyValues || <Placeholder>Enter company values in Step 3.</Placeholder>}</p>
                  </>
                )}
                
                {showOrganogram && (
                  <>
                <h3>2.{chapterTwoHeadingNumbers.organogram} ORGANOGRAM</h3>
                <div className="keep-together">
                <ImageSelector
                    images={previewData.organogramImage}
                    caption={previewData.organogramCaption}
                    onImagesChange={handleOrganogramImageChange}
                    onCaptionChange={handleOrganogramCaptionChange}
                    maxImages={1}
                    figurePrefix="2.1"
                />
                </div>
                {previewData.organogramAbbreviationsHtml ? (
                    <div dangerouslySetInnerHTML={previewData.organogramAbbreviationsHtml} className="prose"></div>
                ) : !isPurchased ? (
                    <p><Placeholder>Enter Organogram abbreviations in step 3...</Placeholder></p>
                ) : null}
                  </>
                )}
            </LockedContent>
          </div>
          )}

          {/* Chapter 3 */}
          <div id="chapter-3-page" className="page-break">
            <LockedContent isPurchased={isPurchased}>
                <h2>CHAPTER 3: SKILLS LEARNT</h2>
                {previewData.skillsChapterHtml ? <div dangerouslySetInnerHTML={previewData.skillsChapterHtml}></div> : <p>This chapter will be automatically generated based on your inputs in Step 4.</p>}
            </LockedContent>
          </div>

          {/* Chapter 4 */}
          <div id="chapter-4-page" className="page-break">
            <LockedContent isPurchased={isPurchased}>
                <h2>CHAPTER 4: PROJECT DEVELOPED</h2>
                {previewData.projectIntroHtml ? <div dangerouslySetInnerHTML={previewData.projectIntroHtml} /> : <p><Placeholder>Project introduction appears here.</Placeholder></p>}
                
                {previewData.project1_intro && (
                    <>
                        <h3>4.1 Project 1</h3>
                        {previewData.project1_introHtml ? <div dangerouslySetInnerHTML={previewData.project1_introHtml} /> : <p><Placeholder>Project 1 intro appears here.</Placeholder></p>}
                        
                        <h4>4.1.1 Project Description</h4>
                        <div className="keep-together">
                        {previewData.project1_descHtml ? <div dangerouslySetInnerHTML={previewData.project1_descHtml} /> : <p><Placeholder>Project 1 description appears here.</Placeholder></p>}
                        <ImageSelector images={previewData.project1_useCaseDiagram} onImagesChange={handleProject1UseCaseDiagramChange} caption={previewData.project1_useCaseCaption} onCaptionChange={handleProject1UseCaseCaptionChange} figurePrefix="4.1.1" maxImages={1} />
                        </div>
                        
                        <h4>4.1.2 A Key Feature</h4>
                        <div className="keep-together">
                            {previewData.project1_welcomeScreenHtml ? <div dangerouslySetInnerHTML={previewData.project1_welcomeScreenHtml} /> : <p><Placeholder>Feature description appears here.</Placeholder></p>}
                        <ImageSelector images={previewData.project1_welcomeScreenImages} onImagesChange={handleProject1WelcomeScreenImagesChange} caption={previewData.project1_welcomeScreenCaption} onCaptionChange={handleProject1WelcomeScreenCaptionChange} figurePrefix="4.1.2" />
                        </div>

                        <h4>4.1.3 Another Feature</h4>
                        {previewData.project1_signInScreenHtml ? <div dangerouslySetInnerHTML={previewData.project1_signInScreenHtml} /> : <p><Placeholder>Feature description appears here.</Placeholder></p>}
                        
                        <h4>4.1.4 Challenges and Solutions</h4>
                        <div className="keep-together">
                        {previewData.project1_validationHtml ? <div dangerouslySetInnerHTML={previewData.project1_validationHtml} /> : <p><Placeholder>Challenges description appears here.</Placeholder></p>}
                        <ImageSelector images={previewData.project1_signInImages} onImagesChange={handleProject1SignInImagesChange} caption={previewData.project1_signInCaption} onCaptionChange={handleProject1SignInCaptionChange} figurePrefix="4.1.3" />
                        </div>

                        <h4>4.1.5 Another Part of the Project</h4>
                        <div className="keep-together">
                        {previewData.project1_signUpScreenHtml ? <div dangerouslySetInnerHTML={previewData.project1_signUpScreenHtml} /> : <p><Placeholder>Feature description appears here.</Placeholder></p>}
                        <ImageSelector images={previewData.project1_signUpImages} onImagesChange={handleProject1SignUpImagesChange} caption={previewData.project1_signUpCaption} onCaptionChange={handleProject1SignUpCaptionChange} figurePrefix="4.1.4" />
                        </div>
                        
                        <h4>4.1.6 Final State/Main View</h4>
                        <div className="keep-together">
                        {previewData.project1_homeScreenHtml ? <div dangerouslySetInnerHTML={previewData.project1_homeScreenHtml} /> : <p><Placeholder>Feature description appears here.</Placeholder></p>}
                        <ImageSelector images={previewData.project1_homeScreenImages} onImagesChange={handleProject1HomeScreenImagesChange} caption={previewData.project1_homeScreenCaption} onCaptionChange={handleProject1HomeScreenCaptionChange} figurePrefix="4.1.5" />
                        </div>
                        
                        <h4>4.1.7 Tools and Technologies Used</h4>
                        {previewData.project1_toolsHtml ? <div dangerouslySetInnerHTML={previewData.project1_toolsHtml} /> : <p><Placeholder>Tools list appears here.</Placeholder></p>}
                    </>
                )}
                
                {formData.project2_intro && (
                  <>
                    <h3>4.2 Project 2</h3>
                    {previewData.project2_introHtml && <div dangerouslySetInnerHTML={previewData.project2_introHtml} />}
                    
                    <h4>4.2.1 Project Description</h4>
                    {previewData.project2_descHtml && <div dangerouslySetInnerHTML={previewData.project2_descHtml} />}

                    <h4>4.2.2 Project Structure</h4>
                    {previewData.project2_structureHtml && <div dangerouslySetInnerHTML={previewData.project2_structureHtml} />}
                    
                    <h4>4.2.3 User Interface</h4>
                    {previewData.project2_uiHtml && <div dangerouslySetInnerHTML={previewData.project2_uiHtml} />}

                    <h4>4.2.4 Core Functionality</h4>
                    <div className="keep-together">
                        {previewData.project2_coreHtml && <div dangerouslySetInnerHTML={previewData.project2_coreHtml} />}
                        <ImageSelector images={previewData.project2_codeSnippetImages} onImagesChange={handleProject2CodeSnippetImagesChange} caption={previewData.project2_codeSnippetCaption} onCaptionChange={handleProject2CodeSnippetCaptionChange} figurePrefix="4.1.6" />
                    </div>
                    
                    <h4>4.2.5 Tools and Technologies Used</h4>
                    {previewData.project2_toolsHtml && <div dangerouslySetInnerHTML={previewData.project2_toolsHtml} />}
                  </>
                )}
            </LockedContent>
          </div>

          {/* Chapter 5 */}
          <div id="chapter-5-page" className="page-break">
            <LockedContent isPurchased={isPurchased}>
                <h2>CHAPTER 5: CHALLENGES ENCOUNTERED AND CONCLUSION</h2>
                {previewData.challengesHtml ? <div dangerouslySetInnerHTML={previewData.challengesHtml}></div> : <p><Placeholder>Challenges, Conclusion and Recommendations will appear here.</Placeholder></p>}
                {previewData.conclusionHtml && (
                  <div dangerouslySetInnerHTML={previewData.conclusionHtml}></div>
                )}
            </LockedContent>
          </div>
        </>
      )}

      {/* References */}
      {previewData.referencesEnabled && (
        <div id="references-page" className={cn(isFullChapterBreaks ? "page-break" : "my-6 pt-3 border-t border-border/30")}>
            <LockedContent isPurchased={isPurchased}>
                <h2>REFERENCES</h2>
                {previewData.referencesHtml ? <div dangerouslySetInnerHTML={previewData.referencesHtml}></div> : <p>References will appear here.</p>}
            </LockedContent>
        </div>
      )}

    </div>
    </Card>
        </div>
      </div>
    </div>
  );
}