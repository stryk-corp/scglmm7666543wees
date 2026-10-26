'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DocumentType,
  AcademicLevel,
  CitationStyle,
  OutlineNode,
  DocumentSection,
  InquiryQuestion,
  ProjectContext,
} from '@/lib/generator/types';
import { generateDefaultOutline, flattenOutlineSections } from '@/lib/generator/engine/outline-builder';
import { getInquiryQuestions } from '@/lib/generator/engine/question-generator';
import { DocumentConfigStep } from '@/components/scholarverse/document-config-step';
import { InterrogationStep } from '@/components/scholarverse/interrogation-step';
import { OutlineBuilderStep } from '@/components/scholarverse/outline-builder-step';
import { SectionEditorStep } from '@/components/scholarverse/section-editor-step';
import { ReviewExportStep } from '@/components/scholarverse/review-export-step';
import {
  Sparkles,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Layers,
  FileText,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScholarverseWorkspacePage() {
  // Navigation / Stage State (1 to 5)
  const [currentStage, setCurrentStage] = useState<number>(1);

  // Stage 1 State
  const [documentType, setDocumentType] = useState<DocumentType>('term_paper');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('undergraduate');
  const [discipline, setDiscipline] = useState<string>('Computer Science');
  const [institutionName, setInstitutionName] = useState<string>('');
  const [targetPages, setTargetPages] = useState<number>(15);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('APA_7');

  // Stage 2 State (Interrogation)
  const [inquiryAnswers, setInquiryAnswers] = useState<Record<string, string>>({
    primarySubject: 'Impact of Cloud-Native Microservices on Financial Security Architectures',
    targetObjectives:
      '1. Evaluate resilience against DDoS in distributed clusters.\n2. Analyze cryptographic zero-trust network access (ZTNA).\n3. Benchmark transaction latency under high-concurrency event-driven streams.',
    methodologyType: 'Systematic Literature Review & Meta-Synthesis',
    theoreticalFramework: 'Zero-Trust Architecture Model (NIST SP 800-207)',
  });

  // Stage 3 State (Outline)
  const [outline, setOutline] = useState<OutlineNode[]>([]);

  // Stage 4 State (Sections Map)
  const [sections, setSections] = useState<Record<string, DocumentSection>>({});
  const [activeNodeId, setActiveNodeId] = useState<string>('');

  // Questions for Stage 2
  const [questions, setQuestions] = useState<InquiryQuestion[]>([]);

  // Initialize or re-fetch questions when documentType changes
  useEffect(() => {
    const qList = getInquiryQuestions(documentType, academicLevel, discipline);
    setQuestions(qList);

    // If changing document type, reset sensible defaults for testing
    if (documentType === 'essay') {
      setInquiryAnswers({
        primarySubject: 'Ethical Implications of Autonomous AI in Healthcare Triage',
        thesisStatement:
          'While autonomous AI triage optimizes patient throughput, mandatory human physician ratification is ethically indispensable to avoid catastrophic diagnostic liability.',
        targetObjectives:
          '1. Error rate analysis in automated diagnosis\n2. The black-box dilemma in patient consent\n3. Bioethical frameworks under the Nuremberg Code and modern law',
        counterargumentsRequested: 'Yes - include dedicated counterarguments and rebuttal',
      });
    } else if (documentType === 'siwes_report') {
      setInquiryAnswers({
        companyName: 'MainOne Cable Company (Equinix)',
        departmentAssigned: 'Network Operations & Tier-3 Data Center Engineering',
        supervisorName: 'Engr. Kenneth Adeleke',
        toolsAndTech:
          'Cisco Nexus 9000 Switches, OTDR Fiber Reflectometers, Fusion Splicing Units, Wireshark, Nagios Core, Linux BGP Routers',
        weeklyTasksSummary:
          'Routine daily monitoring of core trans-Atlantic submarine cable latency, structured patch-panel maintenance, troubleshooting optical power loss on STM-64 DWDM multiplexers, and configuring OSPF routing areas for client colocation racks.',
      });
    }
  }, [documentType, academicLevel, discipline]);

  // Construct Project Memory summary for prompt injection
  const projectMemorySummary = Object.entries(inquiryAnswers)
    .filter(([_, val]) => typeof val === 'string' && val.trim().length > 0)
    .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
    .join('\n\n');

  // Document Title derived from primary subject
  const documentTitle =
    inquiryAnswers.primarySubject ||
    inquiryAnswers.companyName ||
    `Academic ${documentType.replace('_', ' ').toUpperCase()}`;

  // Advance from Stage 1 to 2
  const handleStage1Next = () => {
    setCurrentStage(2);
  };

  // Advance from Stage 2 to 3 (Generate initial outline)
  const handleStage2Next = () => {
    const dummyContext: ProjectContext = {
      primarySubject: inquiryAnswers.primarySubject || documentTitle,
      targetObjectives: inquiryAnswers.targetObjectives
        ? inquiryAnswers.targetObjectives.split('\n')
        : [],
      organizationProfile:
        documentType === 'siwes_report'
          ? {
              companyName: inquiryAnswers.companyName || 'Host Firm',
              location: 'Nigeria',
              industry: discipline,
              departmentAssigned: inquiryAnswers.departmentAssigned || 'Engineering',
              supervisorName: inquiryAnswers.supervisorName || 'Supervisor',
              startDate: '2024-01-01',
              endDate: '2024-06-30',
              toolsAndTech: (inquiryAnswers.toolsAndTech || '').split(','),
              keyProjects: [],
            }
          : undefined,
    };

    const initialOutline = generateDefaultOutline(
      documentType,
      documentTitle,
      academicLevel,
      dummyContext,
      targetPages
    );

    setOutline(initialOutline);
    setCurrentStage(3);
  };

  // Advance from Stage 3 to 4 (Approve outline & enter workspace)
  const handleApproveOutline = () => {
    const flat = flattenOutlineSections(outline);
    if (flat.length > 0 && !activeNodeId) {
      setActiveNodeId(flat[0].id);
    }
    setCurrentStage(4);
  };

  // Reset entire generator
  const handleReset = () => {
    if (confirm('Are you sure you want to start a new document? Any unsaved edits will be cleared.')) {
      setCurrentStage(1);
      setSections({});
      setOutline([]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </Link>

            <div className="h-4 w-px bg-border/60" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm font-bold text-base">
                S
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-foreground">Scholarverse</span>
                <span className="text-[10px] text-primary font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-primary/10">
                  Co-Author Engine
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs">
            {[
              { num: 1, label: 'Document' },
              { num: 2, label: 'Describe Work' },
              { num: 3, label: 'Blueprint' },
              { num: 4, label: 'Workspace' },
              { num: 5, label: 'Review & Export' },
            ].map((step) => {
              const isActive = currentStage === step.num;
              const isPassed = currentStage > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    // Only allow navigating back to completed steps
                    if (isPassed || (step.num === 4 && outline.length > 0)) {
                      setCurrentStage(step.num);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : isPassed
                      ? 'text-foreground hover:bg-muted font-medium'
                      : 'text-muted-foreground/60 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-white text-primary' : isPassed ? 'bg-primary/20 text-primary' : 'bg-muted'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-red-500 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Document</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentStage === 1 && (
          <DocumentConfigStep
            documentType={documentType}
            setDocumentType={setDocumentType}
            academicLevel={academicLevel}
            setAcademicLevel={setAcademicLevel}
            discipline={discipline}
            setDiscipline={setDiscipline}
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            targetPages={targetPages}
            setTargetPages={setTargetPages}
            citationStyle={citationStyle}
            setCitationStyle={setCitationStyle}
            onNext={handleStage1Next}
          />
        )}

        {currentStage === 2 && (
          <InterrogationStep
            documentType={documentType}
            questions={questions}
            answers={inquiryAnswers}
            setAnswer={(k, v) => setInquiryAnswers((prev) => ({ ...prev, [k]: v }))}
            onBack={() => setCurrentStage(1)}
            onNext={handleStage2Next}
          />
        )}

        {currentStage === 3 && (
          <OutlineBuilderStep
            documentType={documentType}
            title={documentTitle}
            outline={outline}
            setOutline={setOutline}
            onBack={() => setCurrentStage(2)}
            onApprove={handleApproveOutline}
          />
        )}

        {currentStage === 4 && (
          <SectionEditorStep
            documentType={documentType}
            title={documentTitle}
            outline={outline}
            sections={sections}
            setSections={setSections}
            activeNodeId={activeNodeId}
            setActiveNodeId={setActiveNodeId}
            projectMemorySummary={projectMemorySummary}
            citationStyle={citationStyle}
            discipline={discipline}
            academicLevel={academicLevel}
            onProceedToReview={() => setCurrentStage(5)}
          />
        )}

        {currentStage === 5 && (
          <ReviewExportStep
            documentType={documentType}
            title={documentTitle}
            discipline={discipline}
            institutionName={institutionName}
            citationStyle={citationStyle}
            outline={outline}
            sections={sections}
            onBackToEditor={() => setCurrentStage(4)}
          />
        )}
      </main>
    </div>
  );
}
