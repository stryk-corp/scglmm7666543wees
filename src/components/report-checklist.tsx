'use client';

import { useState, useMemo } from 'react';
import type { ReportData } from '@/lib/types';
import {
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  CircleDashed,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';

export interface ReportChecklistProps {
  formData: ReportData;
  onJumpToStep?: (step: number, requiresDetailedMode: boolean) => void;
  className?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  stepNumber: number;
  stepLabel: string;
  isChecked: boolean;
  isRequired: boolean;
  missingHint?: string;
}

export function useDocumentChecklist(formData: ReportData): {
  checks: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  progress: number;
  isAllComplete: boolean;
  docType: string;
} {
  const docType = formData.documentType || 'siwes_report';

  const checks: ChecklistItem[] = useMemo(() => {
    return [
      {
        id: 'topic',
        label: 'Document topic',
        stepNumber: 3,
        stepLabel: 'Add topic',
        isChecked: !!formData.reportTitle?.trim(),
        isRequired: true,
        missingHint: formData.reportTitle?.trim() ? undefined : 'Required before payment and generation',
      },
      {
        id: 'cover',
        label: 'Cover details',
        stepNumber: 2,
        stepLabel: 'Optional',
        isChecked: !!(formData.fullName?.trim() && formData.universityName?.trim()),
        isRequired: false,
        missingHint: formData.fullName?.trim() && formData.universityName?.trim()
          ? undefined
          : 'Optional — add the author and institution in cover details',
      },
      {
        id: 'context',
        label: docType === 'siwes_report' ? 'Training / placement details' : 'Research context',
        stepNumber: 5,
        stepLabel: 'Optional',
        isChecked: docType === 'siwes_report'
          ? !!(
              formData.placeOfAttachment?.trim() ||
              formData.fieldOfStudy?.trim() ||
              formData.primarySkill?.trim() ||
              formData.technologiesUsed?.trim() ||
              formData.projectsDescription?.trim()
            )
          : !!(
              formData.thesisStatement?.trim() ||
              formData.researchQuestions?.trim() ||
              formData.theoreticalFramework?.trim() ||
              formData.methodologyType?.trim() ||
              formData.projectsDescription?.trim()
            ),
        isRequired: false,
        missingHint: undefined,
      },
      {
        id: 'generation',
        label: 'Document generated',
        stepNumber: 7,
        stepLabel: 'Generate',
        isChecked: !!(
          formData.abstractText?.trim() &&
          formData.skillsChapterText?.trim() &&
          formData.conclusionText?.trim()
        ),
        isRequired: true,
        missingHint: 'Generate the document after adding a topic',
      },
    ];
  }, [formData, docType]);

  const requiredChecks = checks.filter((check) => check.isRequired);
  const totalCount = requiredChecks.length;
  const completedCount = requiredChecks.filter((check) => check.isChecked).length;
  const progress = (completedCount / totalCount) * 100;
  const isAllComplete = completedCount === totalCount;

  return { checks, completedCount, totalCount, progress, isAllComplete, docType };
}

// Clean, Minimalist Floating HUD Component
export function ReportChecklist({ formData, onJumpToStep, className }: ReportChecklistProps) {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);

  const { checks, completedCount, totalCount, progress, isAllComplete } =
    useDocumentChecklist(formData);

  const handleJump = (step: number) => {
    if (onJumpToStep) {
      onJumpToStep(step, step !== 7);
      const formEl = document.getElementById('form-container');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    }
    setIsChecklistOpen(false);
  };

  return (
    <div id="report-checklist-container" className={cn('fixed bottom-24 right-3.5 sm:bottom-6 sm:right-6 z-40 pointer-events-auto print:hidden no-print', className)}>
      <Collapsible open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
        <div className="flex flex-col items-end gap-2">
            <CollapsibleContent className="w-80 sm:w-[340px] animate-in slide-in-from-bottom-2 duration-200">
              <div className="glass-card shadow-2xl rounded-2xl border border-border/80 overflow-hidden">
                {/* Clean Header */}
                <div className="p-3.5 bg-card/80 border-b border-border/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">Document Checklist</h4>
                      <span className="text-[10px] font-mono font-semibold text-primary">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {completedCount} of {totalCount} required steps complete
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChecklistOpen(false)}
                    className="p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <Progress value={progress} className="h-1 w-full bg-border/40" />

                {/* Checklist Line Items */}
                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                  {checks.map((check) => (
                    <button
                      key={check.id}
                      type="button"
                      onClick={() => handleJump(check.stepNumber)}
                      className={cn(
                        'w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer text-xs',
                        check.isChecked
                          ? 'hover:bg-emerald-500/10'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {check.isChecked ? (
                          <div className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 border border-border">
                            <CircleDashed className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span
                            className={cn(
                              'text-xs font-medium block truncate',
                              check.isChecked ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {check.label}
                          </span>
                          {!check.isRequired && (
                            <span className="text-[10px] text-muted-foreground">Optional</span>
                          )}
                          {check.missingHint && (
                            <span className="text-[10px] text-amber-600 font-medium block truncate">
                              {check.missingHint}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border flex-shrink-0">
                        {check.stepLabel}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Complete Status */}
                {isAllComplete && (
                  <div className="p-2.5 bg-primary/10 border-t border-primary/20 flex items-center gap-2 text-xs text-primary font-medium">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>Required steps complete. Ready to save.</span>
                  </div>
                )}
              </div>
            </CollapsibleContent>

            {/* Clean, Compact Floating Pill Launcher */}
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  'h-10 px-3.5 rounded-full glass-card border border-border shadow-md flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none',
                  isAllComplete && 'border-primary/40 text-primary'
                )}
                title="Toggle Document Readiness Checklist"
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0',
                    isAllComplete
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary border border-primary/25'
                  )}
                >
                  {isAllComplete ? <Check className="w-3 h-3 stroke-[3]" /> : `${completedCount}`}
                </div>

                <span className="text-xs font-semibold text-foreground">
                  Checklist
                </span>

                <span className="text-[11px] font-mono text-muted-foreground">
                  {Math.round(progress)}%
                </span>

                {isChecklistOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
        </div>
      </Collapsible>
    </div>
  );
}
