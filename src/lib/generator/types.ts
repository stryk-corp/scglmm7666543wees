export type DocumentType = 'research_project' | 'essay' | 'term_paper' | 'siwes_report';

export type AcademicLevel = 'secondary' | 'undergraduate' | 'postgraduate';

export type CitationStyle = 'APA_7' | 'IEEE' | 'MLA_9' | 'HARVARD' | 'CHICAGO';

export type SectionStatus = 'not_started' | 'draft' | 'needs_revision' | 'approved';

export interface OutlineNode {
  id: string;
  title: string;
  level: 1 | 2 | 3; // 1 = Chapter / Main Section, 2 = Sub-section, 3 = Topic
  chapterNumber?: number;
  sectionNumber?: string; // e.g. "1.1", "2.3.1"
  estimatedWords: number;
  status: SectionStatus;
  purpose: string;
  keyQuestions?: string[];
  children?: OutlineNode[];
}

export interface EvaluationScore {
  academicDepth: number; // 0 - 100
  evidenceCoverage: number; // 0 - 100
  coherence: number; // 0 - 100
  passedCriteria: boolean;
  critiqueSummary: string;
  flags: Array<{
    type: 'missing_citation' | 'unsubstantiated_claim' | 'repetition' | 'formatting' | 'shallow_analysis';
    description: string;
    suggestedFix: string;
  }>;
}

export interface DocumentSection {
  id: string;
  projectId: string;
  nodeId: string;
  heading: string;
  hierarchicalPath: string; // e.g. "Chapter 2 > 2.2 Empirical Review"
  order: number;
  purposePrompt: string;
  keyQuestionsToAnswer: string[];
  requiredEvidenceIds: string[];
  contentMarkdown: string;
  plainText: string;
  wordCount: number;
  status: SectionStatus;
  version: number;
  evaluation?: EvaluationScore;
  lastRegeneratedAt?: string;
  updatedAt: string;
}

export interface DocumentSource {
  id: string;
  projectId: string;
  type: 'academic_paper' | 'book' | 'manual' | 'siwes_logbook_entry' | 'company_data';
  title: string;
  authors: string[];
  year?: number;
  publicationOrOrg?: string;
  doiOrUrl?: string;
  rawContent?: string;
  logbookWeek?: number;
  toolsUsed?: string[];
  verificationStatus: 'verified' | 'user_supplied' | 'suggested_pending_verification';
  citationKey: string;
}

export interface InquiryQuestion {
  id: string;
  question: string;
  subtext: string;
  type: 'text' | 'textarea' | 'select' | 'multi_select' | 'date_range';
  options?: string[];
  placeholder?: string;
  required: boolean;
  fieldKey: string;
}

export interface ProjectContext {
  primarySubject: string;
  targetObjectives: string[];
  scopeNote?: string;
  
  // Essay specific
  thesisStatement?: string;
  centralArgument?: string;
  counterargumentsRequested?: boolean;

  // Term paper specific
  researchQuestions?: string[];
  methodologyType?: 'quantitative' | 'qualitative' | 'mixed' | 'literature_review';
  theoreticalFramework?: string;

  // SIWES specific
  organizationProfile?: {
    companyName: string;
    location: string;
    industry: string;
    departmentAssigned: string;
    supervisorName: string;
    startDate: string;
    endDate: string;
    toolsAndTech: string[];
    keyProjects: string[];
    weeklyTasksSummary?: string;
  };
}

export interface Project {
  id: string;
  ownerId: string;
  documentType: DocumentType;
  title: string;
  academicLevel: AcademicLevel;
  discipline: string;
  department: string;
  institutionId?: string;
  institutionName: string;
  targetLengthPages: {
    min: number;
    max: number;
  };
  citationStyle: CitationStyle;
  projectContext: ProjectContext;
  outline: OutlineNode[];
  status: 'configuring' | 'outline_approved' | 'in_progress' | 'completed' | 'archived';
  activeSectionId?: string;
  createdAt: string;
  updatedAt: string;
}
