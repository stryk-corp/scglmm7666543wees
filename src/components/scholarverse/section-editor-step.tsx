'use client';

import React, { useState } from 'react';
import { OutlineNode, DocumentSection, EvaluationScore, ProjectContext, DocumentType } from '@/lib/generator/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Minimize2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wand2,
  Layers,
  GraduationCap,
  Hammer
} from 'lucide-react';
import { generateSectionContentAction, evaluateSectionContentAction } from '@/lib/generator/actions';
import { Progress } from '@/components/ui/progress';

interface SectionEditorStepProps {
  documentType: DocumentType;
  title: string;
  outline: OutlineNode[];
  sections: Record<string, DocumentSection>;
  setSections: React.Dispatch<React.SetStateAction<Record<string, DocumentSection>>>;
  activeNodeId: string;
  setActiveNodeId: (id: string) => void;
  projectMemorySummary: string;
  citationStyle: string;
  discipline: string;
  academicLevel: 'secondary' | 'undergraduate' | 'postgraduate';
  onProceedToReview: () => void;
}

export function SectionEditorStep({
  documentType,
  title,
  outline,
  sections,
  setSections,
  activeNodeId,
  setActiveNodeId,
  projectMemorySummary,
  citationStyle,
  discipline,
  academicLevel,
  onProceedToReview,
}: SectionEditorStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'evaluation'>('editor');

  // Find active node
  function findNode(nodes: OutlineNode[], id: string): OutlineNode | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNode(n.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  const activeNode = findNode(outline, activeNodeId) || outline[0];
  const activeSection = sections[activeNodeId] || {
    id: activeNodeId,
    projectId: 'active-project',
    nodeId: activeNodeId,
    heading: activeNode.title,
    hierarchicalPath: activeNode.sectionNumber ? `${activeNode.sectionNumber} ${activeNode.title}` : activeNode.title,
    order: 1,
    purposePrompt: activeNode.purpose || '',
    keyQuestionsToAnswer: activeNode.keyQuestions || [],
    requiredEvidenceIds: [],
    contentMarkdown: '',
    plainText: '',
    wordCount: 0,
    status: 'not_started',
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  const handleUpdateProse = (content: string) => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    setSections((prev) => ({
      ...prev,
      [activeNodeId]: {
        ...activeSection,
        contentMarkdown: content,
        wordCount,
        status: wordCount > 0 ? (activeSection.status === 'not_started' ? 'draft' : activeSection.status) : 'not_started',
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleMarkStatus = (newStatus: 'draft' | 'needs_revision' | 'approved') => {
    setSections((prev) => ({
      ...prev,
      [activeNodeId]: {
        ...activeSection,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // AI Generation Trigger
  const triggerAiAction = async (action: 'initial_draft' | 'expand' | 'simplify' | 'add_practical_example' | 'academic_tone') => {
    setIsGenerating(true);
    try {
      const res = await generateSectionContentAction({
        documentType: documentType as 'research_project' | 'essay' | 'term_paper' | 'siwes_report',
        academicLevel,
        discipline,
        citationStyle,
        projectTitle: title,
        sectionHeading: activeNode.title,
        hierarchicalPath: activeSection.hierarchicalPath,
        sectionPurpose: activeNode.purpose || 'Deliver a comprehensive scholarly explanation.',
        keyQuestions: activeNode.keyQuestions,
        projectMemorySummary,
        targetWordCount: activeNode.estimatedWords || 400,
        actionInstruction: action,
        currentDraft: activeSection.contentMarkdown || undefined,
      });

      if (res.success && res.data) {
        handleUpdateProse(res.data.contentMarkdown);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Evaluation Trigger
  const triggerEvaluation = async () => {
    if (!activeSection.contentMarkdown.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await evaluateSectionContentAction({
        sectionHeading: activeNode.title,
        sectionPurpose: activeNode.purpose || '',
        contentMarkdown: activeSection.contentMarkdown,
        citationStyle,
        documentType: documentType as 'research_project' | 'essay' | 'term_paper' | 'siwes_report',
      });

      if (res.success && res.data) {
        setSections((prev) => ({
          ...prev,
          [activeNodeId]: {
            ...activeSection,
            evaluation: res.data,
            status: res.data.passedCriteria ? 'approved' : 'needs_revision',
            updatedAt: new Date().toISOString(),
          },
        }));
        setActiveTab('evaluation');
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Calculate overall document completion
  const totalLeafNodes = outline.reduce((acc, curr) => {
    return acc + (curr.children ? curr.children.length : 1);
  }, 0);

  const completedSections = Object.values(sections).filter(
    (s) => s.status === 'approved' || s.status === 'draft'
  ).length;

  const progressPercent = Math.min(100, Math.round((completedSections / Math.max(1, totalLeafNodes)) * 100));

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-500">
      {/* Top Workspace Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground line-clamp-1">{title}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{discipline}</span>
              <span>·</span>
              <span className="capitalize">{documentType.replace('_', ' ')}</span>
              <span>·</span>
              <span>{citationStyle}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Document Progress:</span>
            <div className="w-24">
              <Progress value={progressPercent} className="h-2" />
            </div>
            <span className="text-xs font-mono font-bold text-foreground">{progressPercent}%</span>
          </div>

          <Button onClick={onProceedToReview} size="sm" className="gap-2 font-semibold shadow-sm">
            <span>Review & Export</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Grid: 3 Panes (Outline Tree | Editor | AI Copilot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[680px]">
        {/* Left Pane: Section Tree (3 Cols) */}
        <div className="lg:col-span-3 border border-border/60 rounded-xl bg-card/40 p-3 space-y-3 h-[680px] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <span className="text-xs font-bold text-foreground tracking-wide uppercase">Document Outline</span>
            <Badge variant="outline" className="text-[10px]">
              {totalLeafNodes} Sections
            </Badge>
          </div>

          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-1.5">
              {outline.map((node) => {
                const hasChildren = node.children && node.children.length > 0;
                if (hasChildren) {
                  return (
                    <div key={node.id} className="space-y-1 mb-2">
                      <div className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase px-2 py-1">
                        {node.title}
                      </div>
                      <div className="pl-2 space-y-1">
                        {node.children!.map((child) => {
                          const childSection = sections[child.id];
                          const isSelected = activeNodeId === child.id;
                          const status = childSection?.status || 'not_started';

                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => setActiveNodeId(child.id)}
                              className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                  : 'hover:bg-muted/60 text-foreground'
                              }`}
                            >
                              <div className="truncate flex-1">
                                <span className="font-mono text-[10px] mr-1.5 opacity-80">{child.sectionNumber}</span>
                                <span>{child.title}</span>
                              </div>
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  status === 'approved'
                                    ? 'bg-emerald-500'
                                    : status === 'draft'
                                    ? 'bg-amber-500'
                                    : 'bg-muted-foreground/30'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                const isSelected = activeNodeId === node.id;
                const status = sections[node.id]?.status || 'not_started';

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveNodeId(node.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <span className="truncate flex-1">{node.title}</span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        status === 'approved'
                          ? 'bg-emerald-500'
                          : status === 'draft'
                          ? 'bg-amber-500'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Center Pane: Active Section Editor (6 Cols) */}
        <div className="lg:col-span-6 border border-border/60 rounded-xl bg-card/60 p-4 space-y-3 h-[680px] flex flex-col">
          {/* Section Toolbar */}
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div>
              <div className="text-xs font-semibold text-primary">{activeSection.hierarchicalPath}</div>
              <div className="text-sm font-bold text-foreground">{activeNode.title}</div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  activeSection.status === 'approved'
                    ? 'default'
                    : activeSection.status === 'draft'
                    ? 'secondary'
                    : 'outline'
                }
                className="text-[10px] capitalize"
              >
                {activeSection.status.replace('_', ' ')}
              </Badge>
              <div className="text-xs font-mono text-muted-foreground">
                {activeSection.wordCount} words{' '}
                <span className="text-[10px] opacity-70">/ ~{activeNode.estimatedWords} target</span>
              </div>
            </div>
          </div>

          {/* Section Purpose Banner */}
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground mr-1">Section Intent:</span>
            {activeNode.purpose || 'Provide a rigorous scholarly inquiry.'}
          </div>

          {/* Prose Editor / Evaluation Tab Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'editor' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Prose Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('evaluation')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'evaluation'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Acceptance Score</span>
              {activeSection.evaluation && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSection.evaluation.passedCriteria ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              )}
            </button>
          </div>

          {/* Editor Body */}
          <div className="flex-1 relative flex flex-col">
            {activeTab === 'editor' ? (
              <Textarea
                placeholder="Draft, generate, or paste section prose here. Markdown formatting is supported..."
                value={activeSection.contentMarkdown}
                onChange={(e) => handleUpdateProse(e.target.value)}
                className="flex-1 resize-none bg-background font-serif text-sm leading-relaxed p-4 border border-border/40 focus:border-primary"
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-background border border-border/40 space-y-4 text-xs">
                {activeSection.evaluation ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          {activeSection.evaluation.passedCriteria ? 'Threshold Met' : 'Remediation Required'}
                        </div>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          {activeSection.evaluation.critiqueSummary}
                        </p>
                      </div>
                      <Badge
                        variant={activeSection.evaluation.passedCriteria ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {activeSection.evaluation.passedCriteria ? 'PASSED' : 'ACTION REQUIRED'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg border text-center">
                        <div className="text-[10px] text-muted-foreground">Academic Depth</div>
                        <div className="text-base font-bold font-mono text-foreground mt-0.5">
                          {activeSection.evaluation.academicDepth}%
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg border text-center">
                        <div className="text-[10px] text-muted-foreground">Evidence & Citations</div>
                        <div className="text-base font-bold font-mono text-foreground mt-0.5">
                          {activeSection.evaluation.evidenceCoverage}%
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg border text-center">
                        <div className="text-[10px] text-muted-foreground">Coherence & Flow</div>
                        <div className="text-base font-bold font-mono text-foreground mt-0.5">
                          {activeSection.evaluation.coherence}%
                        </div>
                      </div>
                    </div>

                    {activeSection.evaluation.flags && activeSection.evaluation.flags.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-foreground">Flagged Areas:</span>
                        {activeSection.evaluation.flags.map((flag, i) => (
                          <div key={i} className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1">
                            <div className="font-semibold text-amber-600 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="capitalize">{flag.type.replace('_', ' ')}</span>
                            </div>
                            <p className="text-muted-foreground">{flag.description}</p>
                            <p className="text-[11px] text-foreground font-medium">Fix: {flag.suggestedFix}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No evaluation recorded yet. Run &quot;Evaluate Acceptance Criteria&quot; in the Copilot pane to test
                      this section against scholarly rubrics.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Editor Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkStatus('approved')}
                className="h-8 text-xs gap-1.5 text-emerald-600 hover:text-emerald-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Approved</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={triggerEvaluation}
              disabled={isEvaluating || !activeSection.contentMarkdown.trim()}
              className="h-8 text-xs gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>{isEvaluating ? 'Evaluating...' : 'Evaluate Criteria'}</span>
            </Button>
          </div>
        </div>

        {/* Right Pane: AI Writing Copilot Actions (3 Cols) */}
        <div className="lg:col-span-3 border border-border/60 rounded-xl bg-card/40 p-4 space-y-4 h-[680px] flex flex-col">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground tracking-wide uppercase">AI Writing Engine</span>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => triggerAiAction('initial_draft')}
              disabled={isGenerating}
              size="sm"
              className="w-full justify-start text-xs h-9 gap-2 font-semibold shadow-sm"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing...' : 'Draft Section from Blueprint'}</span>
            </Button>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Surgical Refinement
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAiAction('expand')}
              disabled={isGenerating || !activeSection.contentMarkdown}
              className="w-full justify-start text-xs h-8 gap-2 bg-background hover:bg-muted"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Expand Academic Depth</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAiAction('add_practical_example')}
              disabled={isGenerating || !activeSection.contentMarkdown}
              className="w-full justify-start text-xs h-8 gap-2 bg-background hover:bg-muted"
            >
              <Hammer className="w-3.5 h-3.5 text-amber-500" />
              <span>Add Concrete Example / Tool</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAiAction('academic_tone')}
              disabled={isGenerating || !activeSection.contentMarkdown}
              className="w-full justify-start text-xs h-8 gap-2 bg-background hover:bg-muted"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Elevate Academic Register</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerAiAction('simplify')}
              disabled={isGenerating || !activeSection.contentMarkdown}
              className="w-full justify-start text-xs h-8 gap-2 bg-background hover:bg-muted"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>Explain in Simpler Terms</span>
            </Button>
          </div>

          {/* Bound Evidence Summary */}
          <div className="flex-1 overflow-y-auto space-y-2 pt-2 border-t border-border/40 text-[11px]">
            <div className="font-bold text-foreground">Project Memory Anchor:</div>
            <p className="text-muted-foreground leading-relaxed line-clamp-6 bg-muted/30 p-2.5 rounded-lg border border-border/30">
              {projectMemorySummary || 'Grounding details collected in Stage 02 are bound to each prompt.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
