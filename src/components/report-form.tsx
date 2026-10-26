'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Dispatch, SetStateAction, ReactNode } from 'react';
import type { ReportData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import mermaid from 'mermaid';
import { Switch } from '@/components/ui/switch';
import {
  getDocumentPrice,
  getDocumentPageLimits,
  getValidPageCount,
  calculatePageBudget,
} from '@/lib/config';
import { cn } from '@/lib/utils';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDocs, collection, updateDoc } from 'firebase/firestore';

import { generateCompanyProfile } from '@/ai/flows/generate-company-profile';
import { generateReportSections } from '@/ai/flows/generate-report-sections';
import { provideAISuggestions } from '@/ai/flows/provide-ai-suggestions';
import { generateSkillsChapter } from '@/ai/flows/generate-skills-chapter';
import { generateChapterFive } from '@/ai/flows/generate-chapter-five';
import { generateDiagram } from '@/ai/flows/generate-diagram-flow';
import { generateTechnicalDetails } from '@/ai/flows/generate-technical-details';
import { generateChapterFour } from '@/ai/flows/generate-chapter-four';
import type {GenerationTokenUsage} from '@/ai/flows/generation-usage';
import type { SuggestibleFields } from '@/lib/schema/suggestions';
import { useNotification } from '@/context/notification-context';
import { getThemesForDocType } from '@/components/cover-themes/cover-page';
import { CoverPreviewModal } from '@/components/cover-themes/cover-preview-modal';

interface ReportFormProps {
  formData: ReportData;
  setFormData: Dispatch<SetStateAction<ReportData>>;
  onStartGeneration: (options: { paymentId: string }) => Promise<boolean>;
  onGenerationCompleted: (paymentId: string) => Promise<void>;
  onGenerationFailed: (paymentId: string) => Promise<void>;
  onFinalizeAndPay: (options: { paymentId: string }) => void;
  isFinalizing: boolean;
  isEditingPurchased: boolean;
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
  isDetailedMode?: boolean;
  setIsDetailedMode?: (enabled: boolean) => void;
}

const TOTAL_STEPS = 7;
type GenerationUsageEntry = GenerationTokenUsage & {
  label: string;
};

const DOCUMENT_TYPES = [
  {
    type: 'term_paper' as const,
    title: 'Term Paper / Seminar',
    price: 1500,
    pagePills: [5, 8, 10, 15],
    description: 'University course assignments, departmental papers and research seminars.',
  },
  {
    type: 'siwes_report' as const,
    title: 'SIWES / IT Report',
    price: 6000,
    pagePills: [10, 15, 20, 25],
    description: 'Industrial training (SIWES) and internship logbook defense reports.',
  },
  {
    type: 'essay' as const,
    title: 'Academic Essay',
    price: 500,
    pagePills: [2, 3, 5, 7],
    description: 'Structured academic essays, critical write-ups and analytical reviews.',
  },
];

const ACADEMIC_LEVELS = [
  { id: 'secondary' as const, label: 'Secondary' },
  { id: 'undergraduate' as const, label: 'Undergraduate' },
  { id: 'postgraduate' as const, label: 'Postgraduate' },
];

/* ---------- Small, quiet building blocks (module level so inputs never remount) ---------- */

function StepHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1.5">
      <h2 className="font-serif text-2xl leading-tight tracking-tight text-foreground sm:text-[1.75rem]">{title}</h2>
      {description && <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-border pt-6">
      {title && <h3 className="text-sm font-medium text-foreground">{title}</h3>}
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  action,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">{label}</Label>
        {action}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AiButton({
  onClick,
  busy,
  disabled,
  children,
}: {
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:underline disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy && <Loader2 className="h-3 w-3 animate-spin" />}
      {children}
    </button>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-2.5 text-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-primary bg-primary/[0.05] font-medium text-foreground ring-1 ring-primary'
          : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

const fieldClass = 'h-10 text-sm';

export default function ReportForm({
  formData,
  setFormData,
  onStartGeneration,
  onGenerationCompleted,
  onGenerationFailed,
  onFinalizeAndPay,
  isFinalizing,
  isEditingPurchased,
  currentStep: propCurrentStep,
  setCurrentStep: propSetCurrentStep,
  isDetailedMode: propIsDetailedMode,
  setIsDetailedMode: propSetIsDetailedMode,
}: ReportFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [internalStep, setInternalStep] = useState(1);
  const currentStep = propCurrentStep ?? internalStep;
  const setCurrentStep = propSetCurrentStep ?? setInternalStep;
  const [internalDetailedMode, setInternalDetailedMode] = useState(true);
  const isDetailedMode = propIsDetailedMode ?? internalDetailedMode;
  const setDetailedMode = (enabled: boolean) => {
    if (propSetIsDetailedMode) propSetIsDetailedMode(enabled);
    else setInternalDetailedMode(enabled);
  };
  const [saveDetailsToProfile, setSaveDetailsToProfile] = useState(false);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');

  const [hasGeneratedToday, setHasGeneratedToday] = useState(false);
  const isHumanized = true;

  const [loadingStates, setLoadingStates] = useState({
    profile: false,
    diagram: false,
    technicalDetails: false,
  });
  const [generatingField, setGeneratingField] = useState<SuggestibleFields | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationTokenUsage, setGenerationTokenUsage] = useState<GenerationUsageEntry[]>([]);
  const [showTopicInspiration, setShowTopicInspiration] = useState(false);
  const { showNotification } = useNotification();

  const docType = formData.documentType || 'term_paper';
  const coverTheme = formData.coverTheme || 'classic-academic';
  const availableThemes = useMemo(() => getThemesForDocType(docType), [docType]);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewInitialThemeId, setPreviewInitialThemeId] = useState<string>('classic-academic');

  // Compute student first name for warm, personal greeting
  const firstName = useMemo(() => {
    const raw = formData.fullName || user?.displayName || '';
    const first = raw.trim().split(/\s+/)[0];
    return first ? first : 'Scholar';
  }, [formData.fullName, user?.displayName]);

  // Check if user has generated reports today
  useEffect(() => {
    if (!user || !firestore) return;
    const todayKey = `generated_today_${user.uid}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    if (typeof window !== 'undefined' && localStorage.getItem(todayKey) === todayStr) {
      setHasGeneratedToday(true);
      return;
    }

    const checkReportsToday = async () => {
      try {
        const reportsRef = collection(firestore, `users/${user.uid}/reports`);
        const snapshot = await getDocs(reportsRef);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        const createdToday = snapshot.docs.some((d) => {
          const data = d.data();
          const createdAt = data.createdAt;
          if (!createdAt) return false;
          const time = createdAt.toMillis
            ? createdAt.toMillis()
            : createdAt.seconds
            ? createdAt.seconds * 1000
            : new Date(createdAt).getTime();
          return time >= startOfToday;
        });

        if (createdToday) {
          setHasGeneratedToday(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(todayKey, todayStr);
          }
        }
      } catch (e) {
        console.warn('Could not verify daily reports:', e);
      }
    };

    checkReportsToday();
  }, [user, firestore]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
  }, []);

  const handleOpenPreview = (themeId: string) => {
    setPreviewInitialThemeId(themeId);
    setIsPreviewModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectDocType = (type: 'siwes_report' | 'term_paper' | 'essay') => {
    const limits = getDocumentPageLimits(type);
    setFormData((prev) => {
      let newPageCount = prev.targetPageCount;
      if (!newPageCount || newPageCount < limits.min) {
        newPageCount = limits.default;
      } else if (newPageCount > limits.max) {
        newPageCount = limits.max;
      }
      return {
        ...prev,
        documentType: type,
        targetPageCount: newPageCount,
        coverTheme:
          type !== 'siwes_report' && prev.coverTheme === 'itf-regulatory'
            ? 'classic-academic'
            : prev.coverTheme || 'classic-academic',
      };
    });
  };

  const handleTargetPageCountChange = (newPageCount: number) => {
    const limits = getDocumentPageLimits(docType);
    if (newPageCount < limits.min) {
      showNotification({
        title: 'Minimum Page Limit',
        message: `${docType === 'term_paper' ? 'Term paper' : docType === 'essay' ? 'Essay' : 'SIWES report'} requires a minimum of ${limits.min} pages.`,
        type: 'warning',
      });
      newPageCount = limits.min;
    } else if (newPageCount > limits.max) {
      newPageCount = limits.max;
    }
    setFormData((prev) => ({ ...prev, targetPageCount: newPageCount }));
  };

  const handleSelectCoverTheme = (themeId: string) => {
    setFormData((prev) => ({ ...prev, coverTheme: themeId }));
  };

  // Securely save student details to their profile in Firestore
  const handleSaveDetailsToProfile = async () => {
    if (!user || !firestore) return;
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        fullName: formData.fullName || '',
        regNumber: formData.regNumber || '',
        universityName: formData.universityName || '',
        facultyName: formData.facultyName || '',
        departmentName: formData.departmentName || '',
      });
    } catch (err) {
      console.warn('Could not auto-save details to profile:', err);
    }
  };

  const getMissingRequiredFields = (step: number) => {
    const requiredFields: Array<[string, string | undefined]> = [];

    if (step === 2) {
      requiredFields.push(
        ['Full name', formData.fullName],
        ['Registration number', formData.regNumber],
        ['University / institution', formData.universityName],
        ['Faculty', formData.facultyName],
        ['Department', formData.departmentName],
        ['Academic level', formData.academicLevel],
      );
    }
    if (step === 3) {
      requiredFields.push(
        ['Topic / training focus', formData.reportTitle],
        ['Course code and title', formData.courseCode],
        ['Supervisor name', formData.supervisorNames],
      );
      if (docType === 'siwes_report') {
        requiredFields.push(['Field of study', formData.fieldOfStudy]);
      }
    }
    if (step === 5 && docType === 'siwes_report') {
      requiredFields.push(
        ['Place of attachment', formData.placeOfAttachment],
        ['Company location', formData.attachmentLocation],
        ['Company background', formData.companyProfile],
        ['Company services / specialization', formData.scopeOfSpecialization],
        ['Company vision (or Not stated)', formData.companyVision],
        ['Company mission (or Not stated)', formData.companyMission],
        ['Company values (or Not stated)', formData.companyValues],
      );
    }
    if (step === 6 && docType === 'siwes_report') {
      requiredFields.push(
        ['Work performed and projects', formData.projectsDescription],
        ['Primary skill learned', formData.primarySkill],
        ['Tools, software, and equipment', formData.technologiesUsed],
        ['Programming language / method (or None)', formData.programmingLanguage],
        ['Framework / standard (or Not applicable)', formData.framework],
        ['Career direction (or Not decided)', formData.careerPath],
      );
    }

    return requiredFields
      .filter(([, value]) => !value?.trim())
      .map(([label]) => label);
  };

  const handleNext = () => {
    if (!isDetailedMode) {
      if (currentStep === 1) {
        setStepDirection('forward');
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (!formData.reportTitle?.trim()) {
          showNotification({ title: 'Add a topic', message: 'Enter a topic before continuing to payment.', type: 'error' });
          return;
        }
        setStepDirection('forward');
        setCurrentStep(7);
      }
      return;
    }

    const missingFields = getMissingRequiredFields(currentStep);
    if (missingFields.length > 0) {
      showNotification({
        title: 'Complete this step',
        message: `Please fill in: ${missingFields.join(', ')}.`,
        type: 'error',
      });
      return;
    }
    if (currentStep === 2 && saveDetailsToProfile) {
      handleSaveDetailsToProfile();
    }
    if (currentStep < TOTAL_STEPS) {
      setStepDirection('forward');
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isDetailedMode) {
      if (currentStep === 7) {
        setStepDirection('backward');
        setCurrentStep(2);
      } else if (currentStep === 2) {
        setStepDirection('backward');
        setCurrentStep(1);
      }
      return;
    }
    if (currentStep > 1) {
      setStepDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToStep = (step: number) => {
    if (step !== 1 && step !== 7) setDetailedMode(true);
    setStepDirection(step > currentStep ? 'forward' : 'backward');
    setCurrentStep(step);
  };

  // AI Company Profile Generator
  const handleGenerateProfile = async () => {
    if (!formData.placeOfAttachment) {
      showNotification({
        title: 'Missing Company Name',
        message: "Please enter your 'Place of Attachment' (company name) first.",
        type: 'error',
      });
      return;
    }
    setLoadingStates((prev) => ({ ...prev, profile: true }));
    try {
      const {
        profile,
        services,
        attachmentLocation,
        ceoName,
        companyVision,
        companyMission,
        companyValues,
      } = await generateCompanyProfile({placeOfAttachment: formData.placeOfAttachment});
      const cleanGeneratedText = (value: unknown) => {
        if (typeof value !== 'string') return '';
        const cleaned = value.trim();
        return cleaned.toLowerCase() === 'null' || cleaned.toLowerCase() === 'undefined'
          ? ''
          : cleaned;
      };
      const generatedServices = Array.isArray(services)
        ? services.map(cleanGeneratedText).filter((service) => service.length > 0)
        : [];
      setFormData((prev) => ({
        ...prev,
        companyProfile: cleanGeneratedText(profile) || cleanGeneratedText(prev.companyProfile),
        scopeOfSpecialization:
          generatedServices.map((service) => `- ${service}`).join('\n') ||
          cleanGeneratedText(prev.scopeOfSpecialization),
        attachmentLocation: cleanGeneratedText(attachmentLocation) || cleanGeneratedText(prev.attachmentLocation),
        ceoName: cleanGeneratedText(ceoName) || cleanGeneratedText(prev.ceoName),
        companyVision: cleanGeneratedText(companyVision) || cleanGeneratedText(prev.companyVision),
        companyMission: cleanGeneratedText(companyMission) || cleanGeneratedText(prev.companyMission),
        companyValues: cleanGeneratedText(companyValues) || cleanGeneratedText(prev.companyValues),
      }));
      showNotification({ title: 'Success', message: 'Company profile generated.', type: 'success' });
    } catch (error) {
      console.error(error);
      showNotification({ title: 'Error', message: 'Failed to generate company profile.', type: 'error' });
    } finally {
      setLoadingStates((prev) => ({ ...prev, profile: false }));
    }
  };

  // AI Organogram Generator
  const handleGenerateDiagram = async () => {
    if (!formData.organogramAbbreviations) {
      showNotification({
        title: 'Missing Roles',
        message: 'Please list company positions or abbreviations first (e.g. MD, CTO, HOD).',
        type: 'error',
      });
      return;
    }
    setLoadingStates((prev) => ({ ...prev, diagram: true }));
    showNotification({ title: 'Generating Chart', message: 'The AI is drawing your organization diagram...', type: 'info' });
    try {
      const { mermaidSyntax: rawMermaidSyntax } = await generateDiagram({
        description: formData.organogramAbbreviations,
      });

      const cleanedSyntax = rawMermaidSyntax.trim().startsWith('graph TD')
        ? rawMermaidSyntax.trim().replace(/^graph TD/i, 'graph TD\n')
        : 'graph TD\n' + rawMermaidSyntax.trim();

      const { svg } = await mermaid.render('mermaid-graph', cleanedSyntax);
      const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
      const viewBox = svgElement.getAttribute('viewBox');
      const width = svgElement.getAttribute('width');
      const height = svgElement.getAttribute('height');

      if (width && height && !viewBox) {
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');

      const gElement = svgElement.querySelector('g');
      if (gElement) {
        gElement.removeAttribute('transform');
      }

      const finalSvg = new XMLSerializer().serializeToString(svgElement);
      const dataUrl = `data:image/svg+xml;base64,${btoa(finalSvg)}`;

      setFormData((prev) => ({
        ...prev,
        organogramImage: [dataUrl],
      }));

      showNotification({ title: 'Success!', message: 'Organization chart has been generated.', type: 'success' });
    } catch (error) {
      console.error('Diagram Generation Error:', error);
      showNotification({ title: 'Error', message: 'Could not generate diagram.', type: 'error' });
    } finally {
      setLoadingStates((prev) => ({ ...prev, diagram: false }));
    }
  };

  // AI Technical Tools Autofill
  const handleGenerateTechnicalDetails = async () => {
    if (!formData.fieldOfStudy) {
      showNotification({ title: 'Missing Course', message: "Please enter your 'Field of Study' first.", type: 'error' });
      return;
    }
    setLoadingStates((prev) => ({ ...prev, technicalDetails: true }));
    try {
      const result = await generateTechnicalDetails({ fieldOfStudy: formData.fieldOfStudy });
      setFormData((prev) => ({
        ...prev,
        primarySkill: result.primarySkill || prev.primarySkill,
        technologiesUsed: result.technologiesUsed || prev.technologiesUsed,
        programmingLanguage: result.programmingLanguage || prev.programmingLanguage,
        framework: result.framework || prev.framework,
        careerPath: result.careerPath || prev.careerPath,
      }));
      showNotification({ title: 'Success', message: 'Tools & skills auto-filled for your course.', type: 'success' });
    } catch (error) {
      console.error(error);
      showNotification({ title: 'Error', message: 'Failed to autofill tools.', type: 'error' });
    } finally {
      setLoadingStates((prev) => ({ ...prev, technicalDetails: false }));
    }
  };

  // Field AI Suggestion Helper
  const handleGenerateSuggestionForField = async (field: SuggestibleFields) => {
    setGeneratingField(field);
    try {
      const result = await provideAISuggestions({ fieldToSuggest: field, existingData: formData });
      if (result && result.suggestion) {
        setFormData((prev) => ({ ...prev, [field]: result.suggestion }));
      }
    } catch (error) {
      console.error(error);
      showNotification({ title: 'Error', message: 'Could not generate suggestion.', type: 'error' });
    } finally {
      setGeneratingField(null);
    }
  };

  // Auto-generate summary & outline for Term Paper / Essay
  const handleAutoGenerateSummaryAndPoints = async () => {
    if (!formData.reportTitle) {
      showNotification({ title: 'Missing Topic', message: 'Please enter your topic in Step 3 first.', type: 'error' });
      return;
    }
    setGeneratingField('thesisStatement');
    try {
      const result1 = await provideAISuggestions({ fieldToSuggest: 'thesisStatement', existingData: formData });
      const result2 = await provideAISuggestions({ fieldToSuggest: 'researchQuestions', existingData: formData });
      setFormData((prev) => ({
        ...prev,
        thesisStatement: result1?.suggestion || prev.thesisStatement,
        researchQuestions: result2?.suggestion || prev.researchQuestions,
      }));
      showNotification({ title: 'Generated!', message: 'Summary and key points created from your topic.', type: 'success' });
    } catch (e) {
      console.error(e);
      showNotification({ title: 'Error', message: 'Could not generate points.', type: 'error' });
    } finally {
      setGeneratingField(null);
    }
  };

  // Curated realistic Nigerian university topics
  const curatedTopicSuggestions = useMemo(() => {
    if (docType === 'siwes_report') {
      return [
        'Full-Stack Web Development, API Integration & Relational Database Design',
        'Enterprise Computer Networking, Fiber Optic Splicing & Routing Architecture',
        'Mobile Application Engineering with Flutter & Cloud Database Synchronization',
      ];
    }
    if (docType === 'essay') {
      return [
        'The Socio-Economic Impact of Remote Work and Digital Freelancing on Nigerian Youths',
        'Ethical Implications and Algorithmic Bias in Autonomous Healthcare Diagnostics',
        'Digital Sovereignty, Surveillance Capitalism and Data Protection in Developing Economies',
      ];
    }
    return [
      'Conversion of Agricultural Residues into Biofuels for Sustainable Energy',
      'Impact of Mobile Banking and Fintech Adoption on Financial Inclusion in Rural Communities',
      'Cybersecurity Challenges in Internet of Things (IoT) Healthcare Networks',
    ];
  }, [docType]);

  // Full 4-Step Academic Synthesis Pipeline
  const handleGenerateAll = async () => {
    const firstIncompleteStep = [2, 3, 5, 6].find((step) => getMissingRequiredFields(step).length > 0);
    if (firstIncompleteStep) {
      setDetailedMode(true);
      setCurrentStep(firstIncompleteStep);
      setStepDirection('backward');
      showNotification({
        title: 'Complete your report details',
        message: `Finish this step before generation: ${getMissingRequiredFields(firstIncompleteStep).join(', ')}.`,
        type: 'error',
      });
      return;
    }
    if (!formData.reportTitle?.trim()) {
      showNotification({ title: 'Add a topic', message: 'Enter a topic before starting paid generation.', type: 'error' });
      setCurrentStep(isDetailedMode ? 3 : 2);
      return;
    }
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationTokenUsage([]);

    const budget = calculatePageBudget(formData.documentType, formData.targetPageCount);
    const paymentId = crypto.randomUUID();
    let paymentWasCharged = false;
    let paymentCompleted = false;

    try {
      const paymentStarted = await onStartGeneration({ paymentId });
      if (!paymentStarted) return;
      paymentWasCharged = true;

      showNotification({
        title: 'Paid — Step 1/4',
        message: `Writing Preliminaries & Abstract (Target: ${budget.targetPages} pgs)...`,
        type: 'info',
      });

      const { tokenUsage: preliminaryUsage, ...sectionsResult } = await generateReportSections({
        reportTitle: formData.reportTitle,
        fullName: formData.fullName || 'Student',
        universityName: formData.universityName || 'University',
        departmentName: formData.departmentName || 'Department',
        facultyName: formData.facultyName || 'Faculty',
        placeOfAttachment: formData.placeOfAttachment || formData.fieldOfStudy || 'Host Facility',
        supervisorNames: formData.supervisorNames || 'Supervisors',
        fieldOfStudy: formData.fieldOfStudy || 'Academic Studies',
        attachmentLocation: formData.attachmentLocation || 'Campus',
        primarySkill: formData.primarySkill || 'Research & Analysis',
        framework: formData.framework || 'Academic Standards',
        programmingLanguage: formData.programmingLanguage || 'Analytical Tools',
        careerPath: formData.careerPath || 'Scholar',
        ceoName: formData.ceoName,
        isHumanized,
        targetWordCount: budget.sectionWordBudgets.abstractWords,
        documentType: formData.documentType,
      });

      setGenerationTokenUsage((prev) => [
        ...prev,
        { label: 'Preliminaries & abstract', ...preliminaryUsage },
      ]);
      setFormData((prev) => ({ ...prev, ...sectionsResult }));
      setGenerationProgress(35);

      showNotification({
        title: 'Step 2/4',
        message: `Writing Literature Review (Budget: ~${budget.sectionWordBudgets.skillsWords} words)...`,
        type: 'info',
      });
      const { tokenUsage: skillsUsage, ...skillsResult } = await generateSkillsChapter({
        ...formData,
        reportTitle: formData.reportTitle,
        isHumanized,
        targetWordCount: budget.sectionWordBudgets.skillsWords,
        documentType: formData.documentType,
      });
      setGenerationTokenUsage((prev) => [
        ...prev,
        { label: 'Skills / literature review', ...skillsUsage },
      ]);
      setFormData((prev) => ({ ...prev, skillsChapterText: skillsResult.skillsChapterText }));
      setGenerationProgress(60);

      showNotification({
        title: 'Step 3/4',
        message: `Analyzing Core Work & Findings (Budget: ~${budget.sectionWordBudgets.chapterFourWords} words)...`,
        type: 'info',
      });
      const { tokenUsage: chapterFourUsage, ...chapterFourResult } = await generateChapterFour({
        reportTitle: formData.reportTitle,
        projectsDescription: formData.projectsDescription?.trim() ||
          `Use the topic "${formData.reportTitle}" as the focus of this ${docLabel}. Develop relevant concepts, analysis, and examples without inventing personal experiences.`,
        technologiesUsed: formData.technologiesUsed || 'Research tools and methodologies',
        targetWordCount: budget.sectionWordBudgets.chapterFourWords,
        documentType: formData.documentType,
      });
      setGenerationTokenUsage((prev) => [
        ...prev,
        { label: 'Core work & findings', ...chapterFourUsage },
      ]);
      setFormData((prev) => ({ ...prev, ...chapterFourResult }));
      setGenerationProgress(85);

      showNotification({
        title: 'Step 4/4',
        message: `Synthesizing Recommendations & Citations (Budget: ~${budget.sectionWordBudgets.chapterFiveWords} words)...`,
        type: 'info',
      });
      const { tokenUsage: chapterFiveUsage, ...chapterFiveResult } = await generateChapterFive({
        ...formData,
        reportTitle: formData.reportTitle,
        isHumanized,
        targetWordCount: budget.sectionWordBudgets.chapterFiveWords,
        documentType: formData.documentType,
      });
      setGenerationTokenUsage((prev) => [
        ...prev,
        { label: 'Recommendations & citations', ...chapterFiveUsage },
      ]);
      setFormData((prev) => ({
        ...prev,
        challengesText: chapterFiveResult.challengesText,
        conclusionText: chapterFiveResult.conclusionText,
        referencesText: chapterFiveResult.referencesText,
      }));
      setGenerationProgress(100);
      await onGenerationCompleted(paymentId);
      paymentCompleted = true;
      setFormData((prev) => ({
        ...prev,
        generationPayment: {
          id: paymentId,
          amount: getDocumentPrice(formData.documentType),
          status: 'complete',
          documentType: formData.documentType || 'term_paper',
        },
      }));

      showNotification({
        title: 'Success!',
        message: `Payment confirmed and all sections generated within the ${budget.targetPages}-page budget.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Full Generation Error:', error);
      if (paymentWasCharged && !paymentCompleted) {
        try {
          await onGenerationFailed(paymentId);
          setFormData((prev) => ({
            ...prev,
            generationPayment: {
              id: paymentId,
              amount: getDocumentPrice(formData.documentType),
              status: 'refunded',
              documentType: formData.documentType || 'term_paper',
            },
          }));
          showNotification({
            title: 'Generation failed — payment refunded',
            message: 'Generation could not be completed. The report charge has been returned to your wallet.',
            type: 'error',
          });
        } catch (refundError) {
          console.error('Generation refund failed:', refundError);
          showNotification({
            title: 'Generation failed — refund needs attention',
            message: 'Generation failed and the automatic refund could not be confirmed. Please contact support before retrying.',
            type: 'error',
          });
        }
      } else if (paymentCompleted) {
        showNotification({
          title: 'Payment confirmed, but generation status is uncertain',
          message: 'Please contact support before retrying to avoid another charge.',
          type: 'error',
        });
      } else {
        showNotification({
          title: 'Payment could not be confirmed',
          message: 'No generation was started. Please try again or check your wallet balance.',
          type: 'error',
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const basePrice = getDocumentPrice(formData.documentType);
  const hasPaidGeneration = formData.generationPayment?.status === 'complete';
  const stepItems = isDetailedMode
    ? [
        { step: 1, title: 'Document' },
        { step: 2, title: 'Cover details' },
        { step: 3, title: 'Topic' },
        { step: 4, title: 'Cover' },
        { step: 5, title: docType === 'siwes_report' ? 'Attachment' : 'Scope' },
        { step: 6, title: docType === 'siwes_report' ? 'Skills' : 'Method' },
        { step: 7, title: 'Generate' },
      ]
    : [
        { step: 1, title: 'Document' },
        { step: 2, title: 'Topic' },
        { step: 7, title: 'Generate' },
      ];

  const chapterOutline =
    docType === 'siwes_report'
      ? ['Prelims', '1. Intro to SIWES', '2. Company Profile', '3. Operations', '4. Work & Projects', '5. Recommendations', 'References']
      : docType === 'term_paper'
      ? ['Prelims', '1. Introduction', '2. Literature Review', '3. Methodology', '4. Analysis & Discussion', '5. Conclusion', 'References']
      : ['Title Page', '1. Thesis & Intro', '2. Argumentation', '3. Case Evidence', '4. Counterarguments', '5. Conclusion', 'Works Cited'];

  const docLabel = docType === 'term_paper' ? 'Term paper' : docType === 'essay' ? 'Academic essay' : 'SIWES report';

  return (
    <div className="space-y-8">
      {isEditingPurchased && (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Archived document.</span> Form inputs are locked. You can adjust
          themes, typography and margins before downloading.
        </p>
      )}

      {/* Step list (wide screens). */}
      <nav aria-label="Steps" className="-mx-1 hidden overflow-x-auto sm:block">
        <ol className="flex min-w-max items-center gap-0.5">
          {stepItems.map((item, index) => {
            const isCurrent = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <li key={item.step}>
                <button
                  type="button"
                  onClick={() => handleJumpToStep(item.step)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isCurrent
                      ? 'bg-muted font-medium text-foreground'
                      : isCompleted
                      ? 'text-foreground hover:bg-muted/60'
                      : 'text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  <span className="tabular-nums">{isDetailedMode ? item.step : index + 1}</span>
                  <span className="ml-1.5">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {isGenerating && (
        <div role="status" aria-live="polite" className="space-y-2.5 rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-foreground">Writing your document</p>
          <Progress value={generationProgress} className="h-1" />
          <p className="text-xs text-muted-foreground">{generationProgress}% · Please keep this page open.</p>
        </div>
      )}

      <fieldset disabled={isEditingPurchased}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div
            key={currentStep}
            className={cn('space-y-8', stepDirection === 'forward' ? 'animate-wizard-right' : 'animate-wizard-left')}
          >
            {/* ============================================================ */}
            {/* STEP 1: DOCUMENT TYPE & LENGTH                               */}
            {/* ============================================================ */}
            {currentStep === 1 && (
              <>
                <StepHeader
                  title={`Hello, ${firstName}`}
                  description={
                    hasGeneratedToday
                      ? 'Need another report? Pick what you are writing.'
                      : 'What do you want to generate today?'
                  }
                />

                <div role="radiogroup" aria-label="Document type" className="space-y-2.5">
                  {DOCUMENT_TYPES.map((item) => {
                    const isSelected = docType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectDocType(item.type)}
                        className={cn(
                          'block w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5',
                          isSelected
                            ? 'border-primary bg-primary/[0.04] ring-1 ring-primary'
                            : 'border-border hover:bg-muted/40'
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className="font-serif text-lg leading-snug text-foreground">{item.title}</h3>
                          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                            ₦{getDocumentPrice(item.type).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        <p className="mt-2.5 text-xs text-muted-foreground">
                          One-time payment · {getValidPageCount(item.type)} pages included by default
                        </p>
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const currentLimits = getDocumentPageLimits(docType);
                  const activeDoc = DOCUMENT_TYPES.find((d) => d.type === docType) || DOCUMENT_TYPES[0];
                  const currentPageCount = getValidPageCount(docType, formData.targetPageCount);
                  const pageBudget = calculatePageBudget(docType, currentPageCount);

                  return (
                    <Section title="Length">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                          Word count is budgeted so your document fits this page count. Minimum {currentLimits.min} pages.
                        </p>
                        <div className="inline-flex items-center overflow-hidden rounded-lg border border-border">
                          <button
                            type="button"
                            aria-label="Fewer pages"
                            disabled={currentPageCount <= currentLimits.min}
                            onClick={() => handleTargetPageCountChange(currentPageCount - 1)}
                            className="h-10 w-10 text-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="min-w-[5.5rem] text-center text-sm tabular-nums text-foreground">
                            {currentPageCount} pages
                          </span>
                          <button
                            type="button"
                            aria-label="More pages"
                            disabled={currentPageCount >= currentLimits.max}
                            onClick={() => handleTargetPageCountChange(currentPageCount + 1)}
                            className="h-10 w-10 text-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {activeDoc.pagePills.map((pages) => (
                          <button
                            key={pages}
                            type="button"
                            aria-pressed={currentPageCount === pages}
                            onClick={() => handleTargetPageCountChange(pages)}
                            className={cn(
                              'rounded-full border px-3 py-1 text-xs tabular-nums transition-colors',
                              currentPageCount === pages
                                ? 'border-primary bg-primary/[0.05] font-medium text-foreground'
                                : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            )}
                          >
                            {pages}
                            {pages === currentLimits.min ? ' (min)' : ''}
                          </button>
                        ))}
                        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                          About {pageBudget.totalWordBudget.toLocaleString()} words
                        </span>
                      </div>
                    </Section>
                  );
                })()}
              </>
            )}

            {/* ============================================================ */}
            {/* STEP 2: STUDENT DETAILS                                      */}
            {/* ============================================================ */}
            {currentStep === 2 && !isDetailedMode && (
              <>
                <StepHeader
                  title="What is your topic?"
                  description="Just enter a topic. We’ll use your saved profile details and create the rest."
                />

                <Field
                  id="reportTitle"
                  label="Topic or training focus"
                  action={
                    <AiButton onClick={() => setShowTopicInspiration(!showTopicInspiration)}>
                      {showTopicInspiration ? 'Hide ideas' : 'Suggest topics'}
                    </AiButton>
                  }
                >
                  <Textarea
                    id="reportTitle"
                    value={formData.reportTitle || ''}
                    onChange={handleInputChange}
                    placeholder={
                      docType === 'siwes_report'
                        ? 'e.g. Web development and database management during industrial training'
                        : 'e.g. How mobile banking affects financial inclusion in Nigeria'
                    }
                    className="min-h-[104px] text-sm leading-relaxed"
                  />
                </Field>

                {showTopicInspiration && (
                  <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border animate-in fade-in-50">
                    {curatedTopicSuggestions.map((topic, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, reportTitle: topic }))}
                          className="flex w-full items-center justify-between gap-4 px-3.5 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                        >
                          <span>{topic}</span>
                          <span className="shrink-0 text-xs text-primary">Use</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {docType === 'siwes_report' && (
                  <details className="rounded-xl border border-border px-4 py-3">
                    <summary className="cursor-pointer text-sm font-medium text-foreground">
                      Add company name (optional)
                    </summary>
                    <div className="mt-4">
                      <Field id="placeOfAttachment" label="Company or placement">
                        <Input
                          id="placeOfAttachment"
                          value={formData.placeOfAttachment}
                          onChange={handleInputChange}
                          placeholder="e.g. Acme Technologies"
                          className={fieldClass}
                        />
                      </Field>
                    </div>
                  </details>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setDetailedMode(true);
                    setStepDirection('forward');
                    setCurrentStep(2);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/[0.04] px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/[0.08]"
                >
                  <span>
                    <span className="block">Add cover details</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      For yourself or someone else
                    </span>
                  </span>
                  <span aria-hidden className="text-primary">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDetailedMode(true);
                    setStepDirection('forward');
                    setCurrentStep(3);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  <span>
                    <span className="block">Customize with more document fields</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      Course, supervisor, research method, workplace and skills
                    </span>
                  </span>
                  <span aria-hidden className="text-muted-foreground">→</span>
                </button>
              </>
            )}

            {currentStep === 2 && isDetailedMode && (
              <>
                <StepHeader
                  title="Cover details"
                  description="Enter the details for the person this document is for. You can make a document for yourself or someone else."
                />

                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field id="fullName" label="Full name *">
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Chima Courage Chiemeka"
                        className={fieldClass}
                      />
                    </Field>
                    <Field id="regNumber" label="Matric / registration number *">
                      <Input
                        id="regNumber"
                        value={formData.regNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. 2021/247172"
                        className={cn(fieldClass, 'font-mono')}
                      />
                    </Field>
                  </div>
                </div>

                <Section title="Institution">
                  <Field id="universityName" label="University / institution *">
                    <Input
                      id="universityName"
                      value={formData.universityName}
                      onChange={handleInputChange}
                      placeholder="e.g. University of Nigeria, Nsukka"
                      className={fieldClass}
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field id="facultyName" label="Faculty *">
                      <Input
                        id="facultyName"
                        value={formData.facultyName}
                        onChange={handleInputChange}
                        placeholder="e.g. Physical Sciences"
                        className={fieldClass}
                      />
                    </Field>
                    <Field id="departmentName" label="Department *">
                      <Input
                        id="departmentName"
                        value={formData.departmentName}
                        onChange={handleInputChange}
                        placeholder="e.g. Computer Science"
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                </Section>

                <Section title="Academic level *">
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="Academic level">
                    {ACADEMIC_LEVELS.map((lvl) => (
                      <Choice
                        key={lvl.id}
                        selected={formData.academicLevel === lvl.id}
                        onClick={() => setFormData((prev) => ({ ...prev, academicLevel: lvl.id }))}
                      >
                        {lvl.label}
                      </Choice>
                    ))}
                  </div>
                </Section>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                  <div>
                    <Label htmlFor="save-details-profile" className="text-sm font-medium text-foreground">
                      Save these as my profile details
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Leave off when creating a document for someone else.
                    </p>
                  </div>
                  <Switch
                    id="save-details-profile"
                    checked={saveDetailsToProfile}
                    onCheckedChange={setSaveDetailsToProfile}
                  />
                </div>
              </>
            )}

            {/* ============================================================ */}
            {/* STEP 3: TOPIC, COURSE & SUPERVISION                          */}
            {/* ============================================================ */}
            {currentStep === 3 && isDetailedMode && (
              <>
                <StepHeader
                  title="What is it about?"
                  description="Enter the topic your lecturer gave you, your course code, and who you are submitting to."
                />

                <div className="space-y-3">
                  <Field
                    id="reportTitle"
                    label={docType === 'siwes_report' ? 'Training focus / subject' : 'Topic / research title *'}
                    action={
                      <AiButton onClick={() => setShowTopicInspiration(!showTopicInspiration)}>
                        {showTopicInspiration ? 'Hide ideas' : 'Suggest topics'}
                      </AiButton>
                    }
                  >
                    <Textarea
                      id="reportTitle"
                      value={formData.reportTitle || ''}
                      onChange={handleInputChange}
                      placeholder={
                        docType === 'siwes_report'
                          ? 'e.g. Technical Report on Telecommunications, Fiber Optics & Web Systems'
                          : docType === 'term_paper'
                          ? 'e.g. Conversion of Agricultural Residues into Biofuels'
                          : 'e.g. Ethical Implications of Artificial Intelligence in Healthcare Diagnostics'
                      }
                      className="min-h-[88px] text-sm leading-relaxed"
                    />
                  </Field>

                  {showTopicInspiration && (
                    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border animate-in fade-in-50">
                      {curatedTopicSuggestions.map((topic, idx) => (
                        <li key={idx}>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, reportTitle: topic }));
                              showNotification({ title: 'Topic Applied', message: 'Topic has been set.', type: 'success' });
                            }}
                            className="flex w-full items-center justify-between gap-4 px-3.5 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/50"
                          >
                            <span>{topic}</span>
                            <span className="shrink-0 text-xs text-primary">Use</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Section title="Course and supervision">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field id="courseCode" label="Course code & title *">
                      <Input
                        id="courseCode"
                        value={formData.courseCode}
                        onChange={handleInputChange}
                        placeholder={docType === 'siwes_report' ? 'e.g. COS 384 or SWE 300' : 'e.g. GSP 106 (Natural Science II)'}
                        className={fieldClass}
                      />
                    </Field>
                    <Field
                      id="supervisorNames"
                      label={docType === 'term_paper' ? "Lecturer's name *" : 'Industry / work supervisor *'}
                    >
                      <Input
                        id="supervisorNames"
                        value={formData.supervisorNames}
                        onChange={handleInputChange}
                        placeholder={docType === 'term_paper' ? 'e.g. Dr. Mrs F.N. Ibeanu' : 'e.g. Engr. Adekunle Balogun'}
                        className={fieldClass}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <Field id="reportMonth" label="Month">
                      <Input
                        id="reportMonth"
                        value={formData.reportMonth}
                        onChange={handleInputChange}
                        placeholder="e.g. February"
                        className={fieldClass}
                      />
                    </Field>
                    <Field id="reportYear" label="Year">
                      <Input
                        type="number"
                        id="reportYear"
                        value={formData.reportYear}
                        onChange={handleInputChange}
                        placeholder="e.g. 2026"
                        className={fieldClass}
                      />
                    </Field>
                  </div>

                  {docType === 'siwes_report' && (
                    <Field id="fieldOfStudy" label="Field of study / discipline *">
                      <Input
                        id="fieldOfStudy"
                        value={formData.fieldOfStudy}
                        onChange={handleInputChange}
                        placeholder="e.g. Computer Science, Mechanical Engineering"
                        className={fieldClass}
                      />
                    </Field>
                  )}
                </Section>
              </>
            )}

            {/* ============================================================ */}
            {/* STEP 4: COVER STYLE                                          */}
            {/* ============================================================ */}
            {currentStep === 4 && isDetailedMode && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <StepHeader
                    title="Choose a cover style"
                    description="Every style includes the university header, course code, your details and your lecturer's name."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPreview(coverTheme)}
                    className="h-9 rounded-lg text-xs"
                  >
                    Preview selected
                  </Button>
                </div>

                <div className="grid max-h-[26rem] grid-cols-2 gap-3 overflow-y-auto pr-1 md:grid-cols-3">
                  {availableThemes.map((t) => {
                    const isSelected = coverTheme === t.id;
                    return (
                      <div
                        key={t.id}
                        className={cn(
                          'flex flex-col overflow-hidden rounded-xl border transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/[0.04] ring-1 ring-primary'
                            : 'border-border hover:bg-muted/40'
                        )}
                      >
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleSelectCoverTheme(t.id)}
                          className="flex-1 space-y-3 p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          <div className={`h-2 w-10 rounded-full bg-gradient-to-r ${t.previewColor}`} />
                          <div>
                            <div className="text-sm font-medium leading-snug text-foreground">{t.name}</div>
                            <span className="mt-0.5 block text-xs text-muted-foreground">{t.category}</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(t.id)}
                          className="border-t border-border px-3.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Preview
                        </button>
                      </div>
                    );
                  })}
                </div>

                <Section title="Chapters in your document">
                  <p className="text-sm leading-relaxed text-muted-foreground">{chapterOutline.join(' · ')}</p>
                </Section>
              </>
            )}

            {/* ============================================================ */}
            {/* STEP 5: FOCUS & BACKGROUND                                   */}
            {/* ============================================================ */}
            {currentStep === 5 && isDetailedMode && (
              <>
                <StepHeader
                  title={docType === 'siwes_report' ? 'Where did you train?' : 'What is this paper about?'}
                  description={
                    docType === 'siwes_report'
                      ? 'Describe your placement and its work. Autofill known company facts or enter Not stated when an official detail is unavailable.'
                      : 'Write a short summary, or let the AI outline the discussion points from your topic.'
                  }
                />

                {docType === 'siwes_report' ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="placeOfAttachment" label="Place of attachment (company name) *">
                        <Input
                          id="placeOfAttachment"
                          value={formData.placeOfAttachment}
                          onChange={handleInputChange}
                          placeholder="e.g. Nanocodes Programming"
                          className={fieldClass}
                        />
                      </Field>
                      <Field id="attachmentLocation" label="Company location / address *">
                        <Input
                          id="attachmentLocation"
                          value={formData.attachmentLocation}
                          onChange={handleInputChange}
                          placeholder="e.g. 12 Chime Avenue, New Haven, Enugu"
                          className={fieldClass}
                        />
                      </Field>
                    </div>

                    <Field
                      id="companyProfile"
                      label="Company background *"
                      action={
                        <AiButton
                          onClick={handleGenerateProfile}
                          busy={loadingStates.profile}
                          disabled={isGenerating || isEditingPurchased}
                        >
                          Autofill company details
                        </AiButton>
                      }
                    >
                      <Textarea
                        id="companyProfile"
                        value={formData.companyProfile}
                        onChange={handleInputChange}
                        placeholder="Describe when the organization was established, its purpose, and the people or communities it serves."
                        className="min-h-[104px] text-sm leading-relaxed"
                      />
                    </Field>

                    <Field id="scopeOfSpecialization" label="Services and specialization *">
                      <Textarea
                        id="scopeOfSpecialization"
                        value={formData.scopeOfSpecialization}
                        onChange={handleInputChange}
                        placeholder="List the organization's main services, products, departments, or areas of work."
                        className="min-h-[88px] text-sm leading-relaxed"
                      />
                    </Field>

                    <Field id="ceoName" label="Managing director / CEO (optional)">
                      <Input
                        id="ceoName"
                        value={formData.ceoName}
                        onChange={handleInputChange}
                        placeholder="e.g. Mr. Chinedu Eze"
                        className={fieldClass}
                      />
                    </Field>

                    <Section title="Organization mission, vision and values">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Use the autofill button if you are unsure. If the organization has no published statement, enter “Not stated” rather than guessing.
                      </p>
                      <Field id="companyVision" label="Vision *">
                        <Textarea
                          id="companyVision"
                          value={formData.companyVision}
                          onChange={handleInputChange}
                          placeholder="What long-term future does the organization aim to create?"
                          className="min-h-[72px] text-sm leading-relaxed"
                        />
                      </Field>
                      <Field id="companyMission" label="Mission *">
                        <Textarea
                          id="companyMission"
                          value={formData.companyMission}
                          onChange={handleInputChange}
                          placeholder="What is the organization's purpose and day-to-day work?"
                          className="min-h-[72px] text-sm leading-relaxed"
                        />
                      </Field>
                      <Field id="companyValues" label="Core values *">
                        <Textarea
                          id="companyValues"
                          value={formData.companyValues}
                          onChange={handleInputChange}
                          placeholder="List the principles that guide the organization, or enter Not stated."
                          className="min-h-[72px] text-sm leading-relaxed"
                        />
                      </Field>
                    </Section>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <Field
                      id="thesisStatement"
                      label="Main topic or problem to solve (optional)"
                      action={
                        <AiButton
                          onClick={handleAutoGenerateSummaryAndPoints}
                          busy={generatingField === 'thesisStatement'}
                          disabled={isGenerating}
                        >
                          Write for me
                        </AiButton>
                      }
                    >
                      <Textarea
                        id="thesisStatement"
                        value={formData.thesisStatement || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. This paper explains how agricultural waste like cassava peels and corn cobs can be converted into clean biofuels to solve energy shortages in Nigeria."
                        className="min-h-[88px] text-sm leading-relaxed"
                      />
                    </Field>

                    <Field
                      id="researchQuestions"
                      label="Key questions or points to cover (optional)"
                      action={
                        <AiButton
                          onClick={() => handleGenerateSuggestionForField('researchQuestions')}
                          busy={generatingField === 'researchQuestions'}
                          disabled={isGenerating}
                        >
                          Suggest points
                        </AiButton>
                      }
                    >
                      <Textarea
                        id="researchQuestions"
                        value={formData.researchQuestions || ''}
                        onChange={handleInputChange}
                        placeholder={'1. What are agricultural residues and biofuels?\n2. Step-by-step methods used to convert waste to fuel\n3. Benefits to the Nigerian economy\n4. Key challenges and solutions'}
                        className="min-h-[96px] font-mono text-sm"
                      />
                    </Field>

                    <Field id="theoreticalFramework" label="A specific theory or angle to include? (optional)">
                      <Input
                        id="theoreticalFramework"
                        value={formData.theoreticalFramework || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. Circular economy theory, Renewable energy act (or leave blank)"
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* STEP 6: TOOLS & METHODOLOGY                                  */}
            {/* ============================================================ */}
            {currentStep === 6 && isDetailedMode && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <StepHeader
                    title={docType === 'siwes_report' ? 'Work, skills, tools and org chart' : 'Research method and sources'}
                    description={
                      docType === 'siwes_report'
                        ? 'Describe your work, skills, tools, methods, and career direction. You can enter None or Not applicable where needed.'
                        : 'Choose your research format and source materials.'
                    }
                  />
                  {docType === 'siwes_report' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 rounded-lg text-xs"
                      onClick={handleGenerateTechnicalDetails}
                      disabled={loadingStates.technicalDetails || isGenerating || isEditingPurchased}
                    >
                      {loadingStates.technicalDetails && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Autofill tools
                    </Button>
                  )}
                </div>

                {docType === 'siwes_report' ? (
                  <div className="space-y-5">
                    <Field id="projectsDescription" label="Work performed and projects completed *">
                      <Textarea
                        id="projectsDescription"
                        value={formData.projectsDescription}
                        onChange={handleInputChange}
                        placeholder="Describe your regular duties, assigned tasks, project goals, your role, and the results. Add a separate paragraph for each project."
                        className="min-h-[120px] text-sm leading-relaxed"
                      />
                    </Field>

                    <Field id="primarySkill" label="Primary skill you learned *">
                      <Input
                        id="primarySkill"
                        value={formData.primarySkill}
                        onChange={handleInputChange}
                        placeholder="e.g. Full-Stack Web Development, Python Programming, or Fiber Optic Splicing"
                        className={fieldClass}
                      />
                    </Field>

                    <Field id="technologiesUsed" label="Tools, software & equipment used *">
                      <Input
                        id="technologiesUsed"
                        value={formData.technologiesUsed}
                        onChange={handleInputChange}
                        placeholder="e.g. VS Code, Git, Python Django, PostgreSQL, Cisco Packet Tracer"
                        className={fieldClass}
                      />
                    </Field>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="programmingLanguage" label="Programming language or technical method *">
                        <Input
                          id="programmingLanguage"
                          value={formData.programmingLanguage}
                          onChange={handleInputChange}
                          placeholder="Enter None if not applicable"
                          className={fieldClass}
                        />
                      </Field>
                      <Field id="framework" label="Framework, standard or workflow *">
                        <Input
                          id="framework"
                          value={formData.framework}
                          onChange={handleInputChange}
                          placeholder="e.g. Agile, ISO standard, or Not applicable"
                          className={fieldClass}
                        />
                      </Field>
                    </div>

                    <Field id="careerPath" label="Career direction or professional goal *">
                      <Input
                        id="careerPath"
                        value={formData.careerPath}
                        onChange={handleInputChange}
                        placeholder="e.g. Software engineering, network administration, or Not decided"
                        className={fieldClass}
                      />
                    </Field>

                    <Field
                      id="organogramAbbreviations"
                      label="Company staff hierarchy (for the organization chart)"
                      action={
                        <AiButton
                          onClick={handleGenerateDiagram}
                          busy={loadingStates.diagram}
                          disabled={isGenerating || isEditingPurchased}
                        >
                          Draw chart
                        </AiButton>
                      }
                    >
                      <Textarea
                        id="organogramAbbreviations"
                        value={formData.organogramAbbreviations}
                        onChange={handleInputChange}
                        placeholder="e.g. MD - Managing Director, CTO - Chief Technology Officer, Lead Dev - Lead Developer, Intern - SIWES Intern"
                        className="min-h-[88px] text-sm leading-relaxed"
                      />
                    </Field>

                    <Field
                      id="challengesText"
                      label="Challenges you faced and how you solved them (optional)"
                      action={
                        <AiButton
                          onClick={() => handleGenerateSuggestionForField('challengesText')}
                          busy={generatingField === 'challengesText'}
                          disabled={isGenerating}
                        >
                          Suggest
                        </AiButton>
                      }
                    >
                      <Textarea
                        id="challengesText"
                        value={formData.challengesText}
                        onChange={handleInputChange}
                        placeholder="e.g. Unstable power supply solved by generator backup, complex code bugs solved by consulting senior engineers."
                        className="min-h-[88px] text-sm leading-relaxed"
                      />
                    </Field>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Research method</Label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Research method">
                        {[
                          { id: 'Systematic Literature Review', label: 'Literature review (standard)' },
                          { id: 'Case Study Analysis', label: 'Case study analysis' },
                          { id: 'Experimental & Survey Analysis', label: 'Survey / practical analysis' },
                        ].map((m) => (
                          <Choice
                            key={m.id}
                            selected={(formData.methodologyType || 'Systematic Literature Review') === m.id}
                            onClick={() => setFormData((prev) => ({ ...prev, methodologyType: m.id }))}
                          >
                            {m.label}
                          </Choice>
                        ))}
                      </div>
                    </div>

                    <Field id="technologiesUsed" label="Information sources to cite (optional)">
                      <Input
                        id="technologiesUsed"
                        value={formData.technologiesUsed}
                        onChange={handleInputChange}
                        placeholder="e.g. Scholarly journal articles, academic textbooks, online databases"
                        className={fieldClass}
                      />
                    </Field>

                    <Field id="challengesText" label="Counter-arguments or challenges to discuss (optional)">
                      <Textarea
                        id="challengesText"
                        value={formData.challengesText}
                        onChange={handleInputChange}
                        placeholder="e.g. High initial processing cost, lack of modern refining equipment in rural areas"
                        className="min-h-[88px] text-sm leading-relaxed"
                      />
                    </Field>
                  </div>
                )}
              </>
            )}

            {/* ============================================================ */}
            {/* STEP 7: WORK DONE, CITATIONS & GENERATION                    */}
            {/* ============================================================ */}
            {currentStep === 7 && (
              <>
                <StepHeader
                  title="Review and generate"
                  description="Review your report details. Required sections must be complete before generation and payment."
                />

                {(() => {
                  const currentPages = getValidPageCount(docType, formData.targetPageCount);
                  const pageBudget = calculatePageBudget(docType, currentPages);
                  return (
                    <dl className="grid grid-cols-3 gap-4 rounded-xl border border-border px-4 py-3.5 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">Document</dt>
                        <dd className="mt-0.5 font-medium text-foreground">{docLabel}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Length</dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-foreground">{currentPages} pages</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Word budget</dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                          ~{pageBudget.totalWordBudget.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  );
                })()}

                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Your topic</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{formData.reportTitle}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    One-time charge: ₦{basePrice.toLocaleString()} (humanized writing included)
                  </p>
                </div>

                <Field
                  id="projectsDescription"
                  label="Extra context (optional)"
                  action={
                    <AiButton
                      onClick={() => handleGenerateSuggestionForField('projectsDescription')}
                      busy={generatingField === 'projectsDescription'}
                      disabled={isGenerating}
                    >
                      Help me write
                    </AiButton>
                  }
                >
                  <Textarea
                    id="projectsDescription"
                    value={formData.projectsDescription}
                    onChange={handleInputChange}
                    placeholder="Add examples or points you want included, or leave blank to use the topic."
                    className="min-h-[148px] text-sm leading-relaxed"
                  />
                </Field>

                <details className="rounded-xl border border-border px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    Optional: references
                  </summary>
                  <div className="mt-4 space-y-4">
                    <Field
                      id="referencesText"
                      label="Specific sources to include"
                      action={
                        <AiButton
                          onClick={() => handleGenerateSuggestionForField('referencesText')}
                          busy={generatingField === 'referencesText'}
                          disabled={isGenerating}
                        >
                          Suggest references
                        </AiButton>
                      }
                    >
                      <Textarea
                        id="referencesText"
                        value={formData.referencesText}
                        onChange={handleInputChange}
                        placeholder="Optional. Leave blank to generate references from your topic."
                        className="min-h-[88px] font-serif text-sm"
                      />
                    </Field>

                  </div>
                </details>

              </>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-start sm:justify-between">
            <Button
              type="button"
              onClick={handlePrev}
              variant="ghost"
              disabled={currentStep === 1 || isGenerating || isFinalizing || hasPaidGeneration}
              className="h-10 self-start rounded-lg px-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </Button>

            {currentStep !== 7 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-10 w-full rounded-lg px-6 text-sm font-medium sm:ml-auto sm:w-auto"
              >
                Continue
              </Button>
            ) : (
              <div className="flex w-full flex-col gap-4 sm:ml-auto sm:w-auto sm:flex-row sm:items-start sm:justify-end">
                <div className="sm:max-w-[15rem]">
                  <Button
                    type="button"
                    onClick={handleGenerateAll}
                    variant={hasPaidGeneration ? 'outline' : 'default'}
                    disabled={isGenerating || isFinalizing || hasPaidGeneration}
                    className="h-10 w-full gap-2 rounded-lg px-5 text-sm font-medium"
                  >
                    {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>
                      {hasPaidGeneration
                        ? 'Generated and paid'
                        : `Pay ₦${basePrice.toLocaleString()} & generate`}
                    </span>
                  </Button>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {hasPaidGeneration
                      ? 'This report is paid. Save it now; starting another generation requires a new report.'
                      : 'Charged from your wallet before generation. If generation fails, we refund the charge.'}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    const paymentId = formData.generationPayment?.id;
                    if (paymentId && hasPaidGeneration) {
                      onFinalizeAndPay({ paymentId });
                    }
                  }}
                  variant={hasPaidGeneration ? 'default' : 'outline'}
                  disabled={isFinalizing || isGenerating || !formData.acknowledgementText || !hasPaidGeneration}
                  className="h-10 gap-2 rounded-lg px-5 text-sm font-medium"
                >
                  {isFinalizing && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save report</span>
                </Button>
              </div>
            )}
          </div>
        </form>
      </fieldset>

      {/* Interactive Cover Preview Modal with Swipe & Keyboard Support */}
      <CoverPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        themes={availableThemes}
        selectedThemeId={coverTheme}
        initialThemeId={previewInitialThemeId}
        onSelectTheme={handleSelectCoverTheme}
        formData={formData}
      />
    </div>
  );
}