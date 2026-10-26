'use client';

import React from 'react';
import type { ReportData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { GraduationCap, Award, Building, BookOpen, Shield, FileText, CheckCircle2 } from 'lucide-react';

export interface CoverThemeMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  previewColor: string;
  badge?: string;
}

export const SIWES_THEMES: CoverThemeMeta[] = [
  {
    id: 'itf-regulatory',
    name: 'ITF Regulatory Standard',
    category: 'Official SIWES',
    description: 'Mandatory Industrial Training Fund (ITF) format with official accreditation header and logbook ID box.',
    previewColor: 'from-green-900/40 to-slate-900 border-green-600',
    badge: 'ITF Standard',
  },
  {
    id: 'classic-academic',
    name: 'Classic Industrial',
    category: 'University Standard',
    description: 'Formal double-border layout with centered serif typography and traditional university formatting.',
    previewColor: 'from-amber-700/20 to-amber-900/20 border-amber-600',
    badge: 'Popular',
  },
  {
    id: 'executive-navy',
    name: 'Executive Corporate',
    category: 'Enterprise',
    description: 'Deep navy header bar, gold accent rules, and an institutional credential block for corporate internships.',
    previewColor: 'from-blue-900 to-slate-900 border-blue-600',
    badge: 'Executive',
  },
  {
    id: 'bold-technical',
    name: 'Engineering Blueprint',
    category: 'STEM & Technical',
    description: 'Engineering blueprint aesthetic with monospace metadata grid, accent lines, and technical tags.',
    previewColor: 'from-cyan-900/40 to-slate-900 border-cyan-500',
    badge: 'STEM',
  },
  {
    id: 'modern-minimal',
    name: 'Modern Internship',
    category: 'Contemporary',
    description: 'Clean asymmetric layout with crisp sans-serif headings, subtle geometric rules, and generous whitespace.',
    previewColor: 'from-slate-800 to-slate-900 border-slate-700',
  },
  {
    id: 'crest-traditional',
    name: 'Crest Industrial',
    category: 'Faculty Seal',
    description: 'Formal university emblem centerpiece, ornate Roman borders, and classical scholarly spacing.',
    previewColor: 'from-yellow-900/30 to-slate-900 border-yellow-500',
  },
  {
    id: 'sidebar-accent',
    name: 'Industrial Spine',
    category: 'Operations',
    description: 'Bold colored vertical spine along the left margin with elegant left-aligned modern typography.',
    previewColor: 'from-emerald-900/30 to-slate-900 border-emerald-500',
  },
  {
    id: 'geometric-frame',
    name: 'Geometric Practicum',
    category: 'Classical',
    description: 'Concentric precision-ruled borders with corner ornaments and symmetrical hierarchical titles.',
    previewColor: 'from-indigo-900/30 to-slate-900 border-indigo-500',
  },
  {
    id: 'modern-banner',
    name: 'Faculty & Industry Banner',
    category: 'Clean Corporate',
    description: 'Solid horizontal department banner with faculty accent badges and clean title hierarchy.',
    previewColor: 'from-purple-900/30 to-slate-900 border-purple-500',
  },
  {
    id: 'contemporary-split',
    name: 'Corporate Split',
    category: 'Dual-Tone',
    description: 'Balanced two-tone vertical split separating institution header and student credentials.',
    previewColor: 'from-rose-900/30 to-slate-900 border-rose-500',
  },
  {
    id: 'typographic-impact',
    name: 'Technical Impact',
    category: 'Bold Editorial',
    description: 'High-contrast large-scale title lettering paired with refined metadata alignment.',
    previewColor: 'from-zinc-800 to-zinc-950 border-zinc-600',
  },
  {
    id: 'research-journal',
    name: 'Practicum Monograph',
    category: 'Applied Industry',
    description: 'Industrial research monograph format with training scope overview and company index.',
    previewColor: 'from-teal-900/30 to-slate-900 border-teal-500',
  },
];

export const TERM_PAPER_THEMES: CoverThemeMeta[] = [
  {
    id: 'classic-academic',
    name: 'Classic Scholarly',
    category: 'University Standard',
    description: 'Traditional double-border layout with centered serif typography for departmental defense.',
    previewColor: 'from-amber-700/20 to-amber-900/20 border-amber-600',
    badge: 'Popular',
  },
  {
    id: 'research-journal',
    name: 'Research Monograph',
    category: 'Journal Style',
    description: 'Academic monograph format with publication metadata block, abstract snippet, and DOI badge.',
    previewColor: 'from-teal-900/30 to-slate-900 border-teal-500',
    badge: 'Peer-Reviewed',
  },
  {
    id: 'itf-regulatory',
    name: 'Faculty Board Standard',
    category: 'Departmental Colloquium',
    description: 'Official academic board submission format with matriculation certification box.',
    previewColor: 'from-green-900/40 to-slate-900 border-green-600',
    badge: 'Faculty Standard',
  },
  {
    id: 'executive-navy',
    name: 'Executive Colloquium',
    category: 'Distinguished Review',
    description: 'Deep navy header bar, gold accent rules, and an institutional credential block.',
    previewColor: 'from-blue-900 to-slate-900 border-blue-600',
    badge: 'Executive',
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    category: 'Contemporary Scholarly',
    description: 'Clean asymmetric layout with crisp sans-serif headings, subtle geometric rules, and whitespace.',
    previewColor: 'from-slate-800 to-slate-900 border-slate-700',
  },
  {
    id: 'bold-technical',
    name: 'Quantitative & STEM',
    category: 'Data & Methodology',
    description: 'Engineering and statistical format with monospace metadata grid and technical tags.',
    previewColor: 'from-cyan-900/40 to-slate-900 border-cyan-500',
    badge: 'STEM',
  },
  {
    id: 'crest-traditional',
    name: 'Crest Dissertation',
    category: 'Faculty Seal',
    description: 'Formal university emblem centerpiece, ornate Roman borders, and classical scholarly spacing.',
    previewColor: 'from-yellow-900/30 to-slate-900 border-yellow-500',
  },
  {
    id: 'sidebar-accent',
    name: 'Editorial Spine',
    category: 'Academic Review',
    description: 'Bold colored vertical spine along the left margin with elegant left-aligned modern typography.',
    previewColor: 'from-emerald-900/30 to-slate-900 border-emerald-500',
  },
  {
    id: 'geometric-frame',
    name: 'Geometric Thesis',
    category: 'Classical Academic',
    description: 'Concentric precision-ruled borders with corner ornaments and symmetrical hierarchical titles.',
    previewColor: 'from-indigo-900/30 to-slate-900 border-indigo-500',
  },
  {
    id: 'modern-banner',
    name: 'Faculty Seminar Banner',
    category: 'Departmental Presentation',
    description: 'Solid horizontal department banner with faculty accent badges and clean title hierarchy.',
    previewColor: 'from-purple-900/30 to-slate-900 border-purple-500',
  },
  {
    id: 'contemporary-split',
    name: 'Contemporary Split',
    category: 'Dual-Tone',
    description: 'Balanced two-tone vertical split separating institution header and research topic credentials.',
    previewColor: 'from-rose-900/30 to-slate-900 border-rose-500',
  },
  {
    id: 'typographic-impact',
    name: 'Typographic Impact',
    category: 'Bold Editorial',
    description: 'High-contrast large-scale title lettering paired with refined metadata alignment.',
    previewColor: 'from-zinc-800 to-zinc-950 border-zinc-600',
  },
];

export const ESSAY_THEMES: CoverThemeMeta[] = [
  {
    id: 'classic-academic',
    name: 'Classical Humanities',
    category: 'Scholarly Tradition',
    description: 'Formal double-border layout with centered serif typography and traditional essay formatting.',
    previewColor: 'from-amber-700/20 to-amber-900/20 border-amber-600',
    badge: 'Popular',
  },
  {
    id: 'modern-minimal',
    name: 'Modern Essayist',
    category: 'Contemporary Discourse',
    description: 'Clean asymmetric layout with crisp sans-serif headings, subtle geometric rules, and whitespace.',
    previewColor: 'from-slate-800 to-slate-900 border-slate-700',
    badge: 'Modern',
  },
  {
    id: 'research-journal',
    name: 'Critical Essay Monograph',
    category: 'Philosophical Journal',
    description: 'Scholarly journal essay format featuring executive thesis synopsis and citation index.',
    previewColor: 'from-teal-900/30 to-slate-900 border-teal-500',
    badge: 'Scholarly',
  },
  {
    id: 'executive-navy',
    name: 'Executive Review',
    category: 'Distinguished Critique',
    description: 'Deep navy header bar, gold accent rules, and an institutional credential block.',
    previewColor: 'from-blue-900 to-slate-900 border-blue-600',
    badge: 'Executive',
  },
  {
    id: 'bold-technical',
    name: 'Empirical Critique',
    category: 'Analytical Essay',
    description: 'High-precision analytical layout with monospace metadata grid and technical tags.',
    previewColor: 'from-cyan-900/40 to-slate-900 border-cyan-500',
    badge: 'Analytical',
  },
  {
    id: 'crest-traditional',
    name: 'Crest Humanities',
    category: 'Faculty Seal',
    description: 'Classical university emblem centerpiece with ornate Roman borders and traditional essay spacing.',
    previewColor: 'from-yellow-900/30 to-slate-900 border-yellow-500',
  },
  {
    id: 'sidebar-accent',
    name: 'Argumentative Spine',
    category: 'Dialectical',
    description: 'Bold colored vertical spine along the left margin highlighting central arguments.',
    previewColor: 'from-emerald-900/30 to-slate-900 border-emerald-500',
  },
  {
    id: 'geometric-frame',
    name: 'Concentric Rhetoric',
    category: 'Classical Frame',
    description: 'Concentric precision-ruled borders with corner ornaments and symmetrical essay title hierarchy.',
    previewColor: 'from-indigo-900/30 to-slate-900 border-indigo-500',
  },
  {
    id: 'modern-banner',
    name: 'Symposium Banner',
    category: 'Colloquium Standard',
    description: 'Solid horizontal ribbon with faculty accent badges and clean essay typography.',
    previewColor: 'from-purple-900/30 to-slate-900 border-purple-500',
  },
  {
    id: 'contemporary-split',
    name: 'Dialectical Split',
    category: 'Dual-Tone',
    description: 'Balanced two-tone vertical split framing thesis premise and critical synthesis.',
    previewColor: 'from-rose-900/30 to-slate-900 border-rose-500',
  },
  {
    id: 'typographic-impact',
    name: 'Editorial Impact',
    category: 'Bold Rhetoric',
    description: 'Oversized punchy headline lettering paired with refined metadata alignment.',
    previewColor: 'from-zinc-800 to-zinc-950 border-zinc-600',
  },
  {
    id: 'itf-regulatory',
    name: 'Academic Review Board',
    category: 'Board Evaluation',
    description: 'Accredited scholarly board presentation with thesis verification and submission docket.',
    previewColor: 'from-green-900/40 to-slate-900 border-green-600',
    badge: 'Board Approved',
  },
];

export function getThemesForDocType(docType: 'siwes_report' | 'term_paper' | 'essay'): CoverThemeMeta[] {
  if (docType === 'term_paper') return TERM_PAPER_THEMES;
  if (docType === 'essay') return ESSAY_THEMES;
  return SIWES_THEMES;
}

export const COVER_THEMES = SIWES_THEMES;

interface CoverPageProps {
  formData: ReportData;
}

const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="opacity-50 italic">{children}</span>
);

export function CoverPage({ formData }: CoverPageProps) {
  const theme = formData.coverTheme || 'classic-academic';
  const docType = formData.documentType || 'siwes_report';

  const university = formData.universityName || <Placeholder>University Name</Placeholder>;
  const rawFaculty = (formData.facultyName || '').trim();
  const faculty = rawFaculty
    ? rawFaculty.toUpperCase().startsWith('FACULTY')
      ? rawFaculty.toUpperCase()
      : `FACULTY OF ${rawFaculty.toUpperCase()}`
    : <Placeholder>Faculty Name</Placeholder>;

  const rawDept = (formData.departmentName || '').trim();
  const department = rawDept
    ? rawDept.toUpperCase().startsWith('DEPARTMENT')
      ? rawDept.toUpperCase()
      : `DEPARTMENT OF ${rawDept.toUpperCase()}`
    : <Placeholder>Department Name</Placeholder>;

  const studentName = formData.fullName || <Placeholder>Student Full Name</Placeholder>;
  const regNumber = formData.regNumber || <Placeholder>Matric / Reg Number</Placeholder>;
  const courseCode = formData.courseCode || <Placeholder>Course Code</Placeholder>;
  const monthYear = `${formData.reportMonth || 'February'}, ${formData.reportYear || '2025'}`;
  
  // Dynamic Title based on document type
  const reportMainTitle = docType === 'siwes_report'
    ? 'STUDENTS INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES)'
    : docType === 'term_paper'
    ? (formData.reportTitle || 'ACADEMIC TERM PAPER & RESEARCH SEMINAR')
    : (formData.reportTitle || formData.thesisStatement || 'ACADEMIC ESSAY & CRITICAL ANALYSIS');

  const reportSubTitle = docType === 'siwes_report'
    ? `TECHNICAL SIWES REPORT (${courseCode})`
    : docType === 'term_paper'
    ? `IN PARTIAL FULFILMENT OF THE REQUIREMENTS FOR THE AWARD`
    : `SUBMITTED FOR ACADEMIC EVALUATION IN ${courseCode}`;

  const hostOrg = formData.placeOfAttachment || formData.fieldOfStudy || <Placeholder>Host Organization / Subject</Placeholder>;
  const supervisor = formData.supervisorNames || 'FACULTY EXAMINING COMMITTEE';

  // 1. CLASSIC ACADEMIC / SCHOLARLY
  if (theme === 'classic-academic') {
    return (
      <div id="cover-page" className="p-4 sm:p-8 md:p-12 min-h-0 sm:min-h-[9.5in] flex flex-col justify-between text-center select-none bg-card break-words hyphens-auto">
        <div className="space-y-2 pt-2">
          <p className="font-bold text-xs sm:text-sm tracking-widest uppercase">{university}</p>
          <p className="font-semibold text-[11px] sm:text-xs tracking-wider uppercase">{faculty}</p>
          <p className="font-medium text-[11px] sm:text-xs tracking-wider uppercase">{department}</p>
        </div>

        {docType === 'term_paper' ? (
          <div className="my-auto py-6 sm:py-8 space-y-3">
            <p className="text-[11px] sm:text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              IN PARTIAL FULFILMENT OF THE REQUIREMENTS FOR THE AWARD
            </p>
            <p className="text-xs sm:text-base font-bold tracking-wide uppercase text-foreground">
              {courseCode}
            </p>
            <div className="w-full h-px bg-foreground/40 my-3" />
            <div className="py-2 space-y-1">
              <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-muted-foreground">
                TERM PAPER TOPIC:
              </p>
              <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight leading-tight px-2 sm:px-4 text-foreground break-words">
                {formData.reportTitle || <Placeholder>Conversion of Agricultural Residues into Biofuels</Placeholder>}
              </h1>
            </div>
            <div className="w-full h-px bg-foreground/40 my-3" />
          </div>
        ) : docType === 'siwes_report' ? (
          <div className="my-auto py-6 sm:py-8 space-y-3 sm:space-y-4">
            <p className="text-[11px] sm:text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              A REPORT PRESENTED IN PARTIAL FULFILMENT FOR THE REQUIREMENT OF THE COURSE
            </p>
            <h1 className="text-lg sm:text-2xl font-extrabold uppercase tracking-tight leading-tight px-2 sm:px-4 text-foreground break-words">
              STUDENTS INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES)
            </h1>
            <h2 className="text-xs sm:text-base font-semibold uppercase text-muted-foreground px-2 sm:px-4">
              TECHNICAL SIWES REPORT ({courseCode})
            </h2>
            <div className="w-16 h-0.5 bg-foreground/40 mx-auto" />
            
            <div className="pt-3 sm:pt-4 space-y-1">
              <p className="text-xs sm:text-sm font-bold uppercase text-foreground tracking-wider break-words">
                PLACE OF ATTACHMENT: {hostOrg}
              </p>
              {formData.attachmentLocation && (
                <p className="text-xs text-muted-foreground break-words">{formData.attachmentLocation}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="my-auto py-6 sm:py-8 space-y-4">
            <div className="w-16 h-0.5 bg-foreground/40 mx-auto" />
            <h1 className="text-lg sm:text-2xl font-extrabold uppercase tracking-tight leading-tight px-2 sm:px-4 break-words">{reportMainTitle}</h1>
            <h2 className="text-xs sm:text-base font-semibold uppercase text-muted-foreground px-2 sm:px-4 break-words">{reportSubTitle}</h2>
            <div className="w-16 h-0.5 bg-foreground/40 mx-auto" />
          </div>
        )}

        <div className="space-y-2 pb-2">
          <p className="text-[10px] sm:text-xs text-muted-foreground tracking-widest font-semibold">BY</p>
          <p className="font-bold text-sm sm:text-base uppercase text-foreground break-words">{studentName}</p>
          <p className="font-mono text-xs font-semibold uppercase text-muted-foreground">
            {docType === 'term_paper' ? 'MATRIC NUMBER:' : 'REG NO:'} {regNumber}
          </p>
          {docType === 'term_paper' && formData.supervisorNames ? (
            <div className="pt-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground">LECTURER NAME:</p>
              <p className="text-xs sm:text-sm font-bold uppercase text-foreground">{supervisor}</p>
            </div>
          ) : docType === 'siwes_report' && formData.supervisorNames ? (
            <div className="pt-2">
              <p className="text-[10px] sm:text-xs font-medium uppercase text-muted-foreground">SUPERVISOR: <span className="font-bold text-foreground">{supervisor}</span></p>
            </div>
          ) : null}
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground pt-2 sm:pt-3 uppercase tracking-wider">{monthYear}</p>
        </div>
      </div>
    );
  }

  // 2. MODERN MINIMAL
  if (theme === 'modern-minimal') {
    return (
      <div id="cover-page" className="p-4 sm:p-8 md:p-12 min-h-0 sm:min-h-[9.5in] flex flex-col justify-between text-left select-none bg-card break-words hyphens-auto">
        <div className="space-y-1 pl-2 sm:pl-4">
          <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
            {docType === 'siwes_report' ? 'Industrial Training Record' : docType === 'term_paper' ? 'Academic Dissertation' : 'Critical Essay'}
          </span>
          <p className="font-bold text-sm sm:text-base uppercase tracking-tight">{university}</p>
          <p className="text-xs text-muted-foreground uppercase">{faculty} · {department}</p>
        </div>

        <div className="my-auto py-6 sm:py-12 pl-2 sm:pl-4 space-y-3 sm:space-y-4">
          <div className="w-12 h-1 bg-primary rounded-full" />
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight uppercase leading-snug break-words">{reportMainTitle}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg break-words">{reportSubTitle}</p>
          
          <div className="pt-3 sm:pt-4 border-t border-border/40 inline-block">
            <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">
              {docType === 'siwes_report' ? 'HOST FACILITY:' : 'FACULTY ADVISOR:'}
            </span>
            <p className="font-bold text-xs sm:text-sm uppercase text-foreground break-words">
              {docType === 'siwes_report' ? hostOrg : supervisor}
            </p>
          </div>
        </div>

        <div className="pl-2 sm:pl-4 pt-4 sm:pt-6 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Prepared By</span>
            <p className="font-bold text-xs sm:text-sm uppercase">{studentName}</p>
            <p className="font-mono text-xs text-muted-foreground">{regNumber}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-mono font-medium text-muted-foreground">{monthYear}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. EXECUTIVE NAVY
  if (theme === 'executive-navy') {
    return (
      <div id="cover-page" className="min-h-0 sm:min-h-[9.5in] flex flex-col justify-between select-none overflow-hidden bg-card break-words hyphens-auto">
        <div className="bg-[#0f172a] text-white p-4 sm:p-8 text-center space-y-2">
          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-1.5" />
          <p className="font-bold text-xs sm:text-sm tracking-widest uppercase">{university}</p>
          <p className="text-[11px] sm:text-xs text-slate-300 uppercase">{faculty}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 uppercase">{department}</p>
        </div>

        <div className="p-4 sm:p-8 my-auto text-center space-y-3 sm:space-y-5">
          <span className="inline-block px-3 py-1 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 uppercase tracking-widest">
            {docType.replace('_', ' ')}
          </span>
          <h1 className="text-lg sm:text-2xl font-extrabold uppercase tracking-tight text-foreground break-words">{reportMainTitle}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto break-words">{reportSubTitle}</p>
          
          <div className="p-3 sm:p-4 rounded-lg bg-muted/40 max-w-sm mx-auto border border-border/40 text-xs">
            <span className="text-muted-foreground font-semibold">
              {docType === 'siwes_report' ? 'PLACE OF ATTACHMENT' : 'SUPERVISING FACULTY'}
            </span>
            <p className="font-bold uppercase text-foreground mt-0.5 break-words">
              {docType === 'siwes_report' ? hostOrg : supervisor}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-8 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div>
            <p className="font-bold uppercase text-foreground">{studentName}</p>
            <p className="font-mono text-muted-foreground">{regNumber}</p>
          </div>
          <div className="text-left sm:text-right font-medium text-muted-foreground">
            <p className="uppercase">{courseCode}</p>
            <p>{monthYear}</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. BOLD TECHNICAL / STEM
  if (theme === 'bold-technical') {
    return (
      <div id="cover-page" className="p-4 sm:p-8 md:p-12 min-h-0 sm:min-h-[9.5in] flex flex-col justify-between font-mono select-none bg-card break-words hyphens-auto">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b-2 border-primary/30 text-xs">
          <div>
            <span className="font-bold text-primary uppercase">[SYS-DOC // {courseCode}]</span>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{university}</p>
          </div>
          <div className="text-right text-[10px] text-muted-foreground">
            <span>VER: 1.0.0</span>
            <p>{monthYear}</p>
          </div>
        </div>

        <div className="my-auto py-6 sm:py-10 space-y-3 sm:space-y-4">
          <div className="text-xs text-primary font-bold tracking-widest uppercase">&gt;&gt; TECHNICAL DISCOURSE</div>
          <h1 className="text-xl sm:text-3xl font-extrabold uppercase text-foreground leading-tight break-words">{reportMainTitle}</h1>
          <p className="text-xs text-muted-foreground leading-relaxed break-words">{reportSubTitle}</p>
          
          <div className="p-3 bg-muted/60 border border-border rounded text-xs space-y-1">
            <span className="text-primary font-bold">
              {docType === 'siwes_report' ? 'DEPLOYMENT_SITE:' : 'FACULTY_SUPERVISOR:'}
            </span>
            <p className="text-foreground font-semibold break-words">
              {docType === 'siwes_report' ? hostOrg : supervisor}
            </p>
          </div>
        </div>

        <div className="pt-3 sm:pt-4 border-t-2 border-primary/30 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px]">CANDIDATE:</span>
            <span className="font-bold text-foreground break-words">{studentName}</span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-muted-foreground block text-[10px]">REG_IDENTIFIER:</span>
            <span className="font-bold text-primary">{regNumber}</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. CREST TRADITIONAL
  if (theme === 'crest-traditional') {
    return (
      <div id="cover-page" className="p-4 sm:p-8 md:p-12 min-h-0 sm:min-h-[9.5in] flex flex-col justify-between text-center select-none bg-card break-words hyphens-auto">
        <div className="space-y-2 pt-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-600 mx-auto flex items-center justify-center text-amber-600 font-bold">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="font-bold text-xs sm:text-base tracking-widest uppercase text-foreground">{university}</p>
          <p className="font-semibold text-[11px] sm:text-xs tracking-wider uppercase text-muted-foreground">{faculty}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground uppercase">{department}</p>
        </div>

        <div className="my-auto py-6 sm:py-8 space-y-3 sm:space-y-4">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-3/4 mx-auto" />
          <h1 className="text-lg sm:text-2xl font-extrabold uppercase tracking-wide text-foreground break-words">{reportMainTitle}</h1>
          <p className="text-xs sm:text-sm italic text-muted-foreground px-2 sm:px-6 break-words">{reportSubTitle}</p>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent w-3/4 mx-auto" />
        </div>

        <div className="space-y-1.5 pb-2 text-xs">
          <p className="text-muted-foreground uppercase tracking-widest font-semibold text-[10px]">PRESENTED BY</p>
          <p className="font-bold text-sm sm:text-base uppercase text-foreground break-words">{studentName}</p>
          <p className="font-mono text-muted-foreground font-semibold">{regNumber}</p>
          <p className="text-muted-foreground pt-1.5 sm:pt-2 uppercase font-medium text-[11px] sm:text-xs">{monthYear}</p>
        </div>
      </div>
    );
  }

  // 6. SIDEBAR STRIPE
  if (theme === 'sidebar-accent') {
    return (
      <div id="cover-page" className="min-h-0 sm:min-h-[9.5in] flex flex-col sm:flex-row select-none overflow-hidden bg-card break-words hyphens-auto">
        <div className="w-full h-10 sm:w-20 sm:h-auto bg-emerald-700 flex sm:flex-col items-center justify-between p-3 sm:py-8 text-white flex-shrink-0">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <span className="sm:rotate-[-90deg] whitespace-nowrap font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase opacity-90">
            {courseCode} · {monthYear}
          </span>
          <div className="w-2 h-2 rounded-full bg-white hidden sm:block" />
        </div>

        <div className="flex-1 p-4 sm:p-8 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="font-bold text-sm sm:text-base uppercase text-foreground">{university}</p>
            <p className="text-xs text-muted-foreground uppercase">{faculty} · {department}</p>
          </div>

          <div className="my-auto py-6 sm:py-8 space-y-3 sm:space-y-4">
            <h1 className="text-xl sm:text-3xl font-extrabold uppercase leading-tight text-foreground break-words">{reportMainTitle}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{reportSubTitle}</p>
            
            <div className="pt-2 text-xs">
              <span className="text-muted-foreground font-semibold">
                {docType === 'siwes_report' ? 'ORGANIZATION:' : 'SUPERVISING FACULTY:'}
              </span>
              <p className="font-bold text-foreground text-xs sm:text-sm uppercase break-words">
                {docType === 'siwes_report' ? hostOrg : supervisor}
              </p>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-border/40 text-xs space-y-1">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Candidate Credentials</span>
            <p className="font-bold text-xs sm:text-sm uppercase text-foreground break-words">{studentName}</p>
            <p className="font-mono text-muted-foreground">{regNumber}</p>
          </div>
        </div>
      </div>
    );
  }

  // 7. GEOMETRIC FRAME
  if (theme === 'geometric-frame') {
    return (
      <div id="cover-page" className="p-4 sm:p-8 md:p-12 min-h-0 sm:min-h-[9.5in] flex flex-col justify-center select-none bg-card break-words hyphens-auto">
        <div className="p-3 sm:p-6 h-full flex flex-col justify-between text-center relative">
          <div className="absolute top-2 left-2 text-[10px] text-muted-foreground">◆</div>
          <div className="absolute top-2 right-2 text-[10px] text-muted-foreground">◆</div>
          <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground">◆</div>
          <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">◆</div>

          <div className="space-y-1.5 pt-2 sm:pt-4">
            <p className="font-extrabold text-xs sm:text-sm uppercase tracking-widest">{university}</p>
            <p className="text-xs text-muted-foreground uppercase">{faculty}</p>
            <p className="text-xs text-muted-foreground uppercase">{department}</p>
          </div>

          <div className="my-auto py-6 sm:py-8 space-y-3 sm:space-y-4">
            <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-wide text-foreground px-2 sm:px-4 break-words">{reportMainTitle}</h1>
            <div className="w-12 h-px bg-border mx-auto" />
            <p className="text-xs text-muted-foreground uppercase break-words">{reportSubTitle}</p>
          </div>

          <div className="space-y-1 pb-2 sm:pb-4 text-xs">
            <p className="font-bold text-xs sm:text-sm uppercase text-foreground break-words">{studentName}</p>
            <p className="font-mono text-muted-foreground">{regNumber}</p>
            <p className="text-muted-foreground font-mono text-[10px] sm:text-[11px] pt-1.5 sm:pt-2">{monthYear}</p>
          </div>
        </div>
      </div>
    );
  }

  // 8. MODERN BANNER
  if (theme === 'modern-banner') {
    return (
      <div id="cover-page" className="min-h-0 sm:min-h-[9.5in] flex flex-col justify-between select-none bg-card overflow-hidden break-words hyphens-auto">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4 sm:p-6 space-y-1">
          <p className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">{university}</p>
          <p className="text-[11px] sm:text-xs text-purple-200 uppercase">{faculty} · {department}</p>
        </div>

        <div className="p-4 sm:p-8 my-auto space-y-3 sm:space-y-4">
          <span className="text-[11px] sm:text-xs font-mono font-bold text-purple-600 uppercase tracking-widest">
            {courseCode} DISSERTATION
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold uppercase text-foreground leading-tight break-words">{reportMainTitle}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{reportSubTitle}</p>
        </div>

        <div className="p-4 sm:p-6 border-t border-border/40 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div>
            <p className="font-bold uppercase text-foreground text-xs sm:text-sm break-words">{studentName}</p>
            <p className="font-mono text-muted-foreground">{regNumber}</p>
          </div>
          <div className="text-left sm:text-right text-muted-foreground font-medium">
            <span>{monthYear}</span>
          </div>
        </div>
      </div>
    );
  }

  // 9. CONTEMPORARY SPLIT
  if (theme === 'contemporary-split') {
    return (
      <div id="cover-page" className="min-h-0 sm:min-h-[9.5in] flex flex-col justify-between select-none bg-card overflow-hidden break-words hyphens-auto">
        <div className="bg-muted/40 p-4 sm:p-8 border-b border-border/40 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Academic Submission</span>
          <h1 className="text-lg sm:text-2xl font-extrabold uppercase text-foreground break-words">{reportMainTitle}</h1>
          <p className="text-xs text-muted-foreground break-words">{reportSubTitle}</p>
        </div>

        <div className="p-4 sm:p-8 my-auto space-y-3 sm:space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Institution:</span>
            <p className="font-bold text-xs sm:text-sm uppercase text-foreground">{university}</p>
            <p className="text-xs text-muted-foreground">{faculty} · {department}</p>
          </div>

          <div className="pt-2 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              {docType === 'siwes_report' ? 'Workplace Placement:' : 'Supervising Faculty:'}
            </span>
            <p className="font-bold text-xs sm:text-sm uppercase text-foreground break-words">
              {docType === 'siwes_report' ? hostOrg : supervisor}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-muted/20 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div>
            <p className="font-bold uppercase text-foreground break-words">{studentName}</p>
            <p className="font-mono text-muted-foreground">{regNumber}</p>
          </div>
          <div className="text-left sm:text-right font-mono text-muted-foreground">
            <span>{monthYear}</span>
          </div>
        </div>
      </div>
    );
  }

  // 10. TYPOGRAPHIC IMPACT
  if (theme === 'typographic-impact') {
    return (
      <div id="cover-page" className="p-4 sm:p-8 md:p-12 min-h-0 sm:min-h-[9.5in] flex flex-col justify-between select-none bg-card break-words hyphens-auto">
        <div className="space-y-1 border-b pb-3 sm:pb-4 border-foreground/20">
          <p className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground">{university}</p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase">{department}</p>
        </div>

        <div className="my-auto py-6 sm:py-12 space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-none text-foreground break-words">
            {reportMainTitle}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground max-w-lg leading-relaxed break-words">{reportSubTitle}</p>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-foreground/20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Author</span>
            <p className="font-bold uppercase text-xs sm:text-sm break-words">{studentName}</p>
            <p className="font-mono text-muted-foreground">{regNumber}</p>
          </div>
          <div className="text-left sm:text-right font-mono text-muted-foreground">
            <span>{monthYear}</span>
          </div>
        </div>
      </div>
    );
  }

  // 11. REGULATORY STANDARD (ITF for SIWES, Board Standard for others)
  if (theme === 'itf-regulatory') {
    return (
      <div id="cover-page" className="p-4 sm:p-8 md:p-12 min-h-0 sm:min-h-[9.5in] flex flex-col justify-between text-center select-none bg-card break-words hyphens-auto">
        <div className="space-y-1.5 pt-2 border-b-2 border-green-700/40 pb-3 sm:pb-4">
          <p className="font-bold text-[10px] sm:text-xs uppercase tracking-widest text-green-700">
            {docType === 'siwes_report'
              ? 'INDUSTRIAL TRAINING FUND (ITF) · FEDERAL REPUBLIC OF NIGERIA'
              : docType === 'term_paper'
              ? 'FACULTY ACADEMIC BOARD · DEPARTMENTAL COLLOQUIUM'
              : 'ACADEMIC SCHOLARSHIP BOARD · EDITORIAL REVIEW'}
          </p>
          <p className="font-extrabold text-xs sm:text-sm uppercase tracking-wide text-foreground">{university}</p>
          <p className="text-xs text-muted-foreground uppercase">{faculty} · {department}</p>
        </div>

        <div className="my-auto py-4 sm:py-6 space-y-3 sm:space-y-4">
          <div className="border border-green-700/30 bg-green-700/5 p-3 sm:p-4 rounded-lg w-full">
            <span className="text-[10px] sm:text-[11px] font-bold text-green-700 uppercase tracking-wider block mb-1">
              {docType === 'siwes_report'
                ? 'ITF FORM 8 / SIWES REPORT'
                : docType === 'term_paper'
                ? 'SEMINAR DISSERTATION DOCKET'
                : 'CRITICAL ESSAY DOSSIER'}
            </span>
            <h1 className="text-lg sm:text-2xl font-extrabold uppercase text-foreground break-words">{reportMainTitle}</h1>
            <p className="text-xs font-semibold text-muted-foreground mt-1">COURSE CODE: {courseCode}</p>
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-muted-foreground font-semibold uppercase text-[10px]">
              {docType === 'siwes_report' ? 'PLACE OF INDUSTRIAL ATTACHMENT:' : 'SUPERVISING FACULTY / ADVISOR:'}
            </span>
            <p className="font-bold text-xs sm:text-sm uppercase text-foreground break-words">
              {docType === 'siwes_report' ? hostOrg : supervisor}
            </p>
            {formData.attachmentLocation && docType === 'siwes_report' && (
              <p className="text-xs text-muted-foreground break-words">{formData.attachmentLocation}</p>
            )}
          </div>
        </div>

        <div className="border-t-2 border-green-700/40 pt-3 sm:pt-4 pb-2 text-xs space-y-1">
          <p className="text-muted-foreground uppercase font-semibold text-[10px]">SUBMITTED BY:</p>
          <p className="font-bold text-sm sm:text-base uppercase text-foreground break-words">{studentName}</p>
          <p className="font-mono text-xs font-semibold text-muted-foreground">MATRICULATION NO: {regNumber}</p>
          <p className="font-medium text-muted-foreground pt-1 text-[11px] sm:text-xs">{monthYear}</p>
        </div>
      </div>
    );
  }

  // 12. RESEARCH MONOGRAPH (JOURNAL STYLE)
  return (
    <div id="cover-page" className="p-4 sm:p-8 md:p-12 min-h-0 sm:min-h-[9.5in] flex flex-col justify-between select-none bg-card break-words hyphens-auto">
      <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          <span className="font-bold uppercase tracking-wider text-primary text-[10px] sm:text-xs">
            {docType === 'siwes_report'
              ? 'Industrial Practicum Archive'
              : docType === 'term_paper'
              ? 'Academic Monograph Series'
              : 'Scholarly Discourse & Essays'}
          </span>
        </div>
        <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">ISSN 2940-1184 · Vol. 24</span>
      </div>

      <div className="my-auto py-6 sm:py-10 space-y-3 sm:space-y-5">
        <span className="text-[11px] sm:text-xs font-mono font-semibold text-muted-foreground uppercase block">{university}</span>
        <h1 className="text-xl sm:text-3xl font-extrabold uppercase leading-tight text-foreground break-words">{reportMainTitle}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg break-words">{reportSubTitle}</p>

        <div className="p-3 bg-muted/30 border border-border/40 rounded-lg text-xs space-y-1">
          <span className="font-bold text-foreground block text-[11px]">
            {docType === 'essay' ? 'Central Thesis Argument:' : 'Executive Scope:'}
          </span>
          <p className="text-muted-foreground leading-relaxed break-words">
            {formData.thesisStatement
              ? formData.thesisStatement
              : formData.abstractText
              ? formData.abstractText.slice(0, 160) + '...'
              : `A systematic academic investigation submitted for the completion of ${courseCode}.`}
          </p>
        </div>
      </div>

      <div className="pt-3 sm:pt-4 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase">
            {docType === 'essay' ? 'Essay Author' : 'Principal Investigator'}
          </span>
          <p className="font-bold uppercase text-foreground text-xs sm:sm break-words">{studentName}</p>
          <p className="font-mono text-muted-foreground">{regNumber}</p>
        </div>
        <div className="text-left sm:text-right font-medium text-muted-foreground">
          <p>{department}</p>
          <p className="font-mono text-[10px] sm:text-[11px]">{monthYear}</p>
        </div>
      </div>
    </div>
  );
}
