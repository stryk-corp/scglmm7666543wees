'use client';

import React from 'react';
import { DocumentType, AcademicLevel, CitationStyle } from '@/lib/generator/types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Briefcase, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DocumentConfigProps {
  documentType: DocumentType;
  setDocumentType: (type: DocumentType) => void;
  academicLevel: AcademicLevel;
  setAcademicLevel: (level: AcademicLevel) => void;
  discipline: string;
  setDiscipline: (d: string) => void;
  institutionName: string;
  setInstitutionName: (i: string) => void;
  targetPages: number;
  setTargetPages: (p: number) => void;
  citationStyle: CitationStyle;
  setCitationStyle: (c: CitationStyle) => void;
  onNext: () => void;
}

const DOCUMENT_OPTIONS = [
  {
    type: 'essay' as DocumentType,
    title: 'Essay',
    badge: 'Argument & Analysis',
    icon: FileText,
    desc: 'Structured critical analysis, argumentative synthesis, and thesis defense with supporting evidence.',
    color: 'from-blue-600/20 to-indigo-600/20 hover:border-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    type: 'term_paper' as DocumentType,
    title: 'Term Paper',
    badge: 'Academic Research',
    icon: BookOpen,
    desc: 'Five-chapter scholarly research: introduction, literature review, methodology, data discussion, and conclusion.',
    color: 'from-emerald-600/20 to-teal-600/20 hover:border-emerald-500',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    type: 'siwes_report' as DocumentType,
    title: 'SIWES / IT Report',
    badge: 'Practical Training',
    icon: Briefcase,
    desc: 'Comprehensive industrial training chronicle: ITF objectives, company profile, technical operations, and weekly tasks.',
    color: 'from-amber-600/20 to-orange-600/20 hover:border-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
];

const ACADEMIC_LEVELS: { id: AcademicLevel; label: string; desc: string }[] = [
  { id: 'secondary', label: 'Secondary / High School', desc: 'Foundational concepts & straightforward register' },
  { id: 'undergraduate', label: 'Undergraduate', desc: 'Standard university depth & empirical balance' },
  { id: 'postgraduate', label: 'Postgraduate / Masters', desc: 'Exhaustive critical theory & advanced synthesis' },
];

const CITATION_STYLES: { id: CitationStyle; label: string; example: string }[] = [
  { id: 'APA_7', label: 'APA 7th Edition', example: '(Author, 2024)' },
  { id: 'IEEE', label: 'IEEE', example: '[1], [2]' },
  { id: 'MLA_9', label: 'MLA 9th Edition', example: '(Author 45)' },
  { id: 'HARVARD', label: 'Harvard Style', example: '(Author 2024: 12)' },
  { id: 'CHICAGO', label: 'Chicago (Author-Date)', example: '(Author 2024)' },
];

export function DocumentConfigStep({
  documentType,
  setDocumentType,
  academicLevel,
  setAcademicLevel,
  discipline,
  setDiscipline,
  institutionName,
  setInstitutionName,
  targetPages,
  setTargetPages,
  citationStyle,
  setCitationStyle,
  onNext,
}: DocumentConfigProps) {
  const isValid = discipline.trim().length > 0;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage 01 · Document Architecture</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Configure your document foundation</h2>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Choose the document archetype and academic parameters. The Scholarverse engine loads custom rubrics,
          chapter templates, and generation constraints based on these choices.
        </p>
      </div>

      {/* 1. Document Archetype Cards */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">What type of document are you creating?</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DOCUMENT_OPTIONS.map((opt) => {
            const isSelected = documentType === opt.type;
            const Icon = opt.icon;
            return (
              <div
                key={opt.type}
                onClick={() => setDocumentType(opt.type)}
                className={`group cursor-pointer rounded-xl border p-5 transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                    : 'border-border/60 hover:border-border bg-card/50 hover:bg-card/80'
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary animate-in zoom-in-75 duration-200" />
                )}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-lg ${opt.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{opt.title}</h3>
                      <Badge variant="outline" className="text-[10px] font-medium tracking-wide">
                        {opt.badge}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Academic Level */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Academic level</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ACADEMIC_LEVELS.map((lvl) => {
            const isSelected = academicLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setAcademicLevel(lvl.id)}
                className={`text-left p-3.5 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm'
                    : 'border-border/60 hover:border-border text-foreground bg-card/40'
                }`}
              >
                <div className="font-semibold">{lvl.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{lvl.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Department & Institution Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discipline" className="text-sm font-semibold text-foreground">
            Discipline / Field of Study <span className="text-red-500">*</span>
          </Label>
          <Input
            id="discipline"
            placeholder="e.g. Computer Science, Public Health, Mechanical Engineering"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="h-10 bg-background"
          />
          <p className="text-[11px] text-muted-foreground">Influences technical terminology, literature models, and methodology.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution" className="text-sm font-semibold text-foreground">
            Institution / University (Optional)
          </Label>
          <Input
            id="institution"
            placeholder="e.g. University of Lagos, Covenant University"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            className="h-10 bg-background"
          />
          <p className="text-[11px] text-muted-foreground">Applies institution-specific preliminary styling and guidelines.</p>
        </div>
      </div>

      {/* 4. Target Length & Citation Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Expected document length</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { pages: 8, label: '5 – 10 pgs', words: '~2,500 words' },
              { pages: 15, label: '10 – 20 pgs', words: '~4,500 words' },
              { pages: 30, label: '20 – 40 pgs', words: '~9,000 words' },
            ].map((p) => (
              <button
                key={p.pages}
                type="button"
                onClick={() => setTargetPages(p.pages)}
                className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                  targetPages === p.pages
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border/60 hover:border-border text-foreground'
                }`}
              >
                <div>{p.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{p.words}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Referencing style</Label>
          <div className="grid grid-cols-2 gap-2">
            {CITATION_STYLES.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCitationStyle(c.id)}
                className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                  citationStyle === c.id
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border/60 hover:border-border text-foreground'
                }`}
              >
                <div>{c.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{c.example}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Next Action */}
      <div className="flex justify-end pt-4 border-t border-border/40">
        <Button
          onClick={onNext}
          disabled={!isValid}
          size="lg"
          className="gap-2 font-semibold shadow-md px-6"
        >
          <span>Continue to Stage 02: Describe Work</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
