'use client';

import React, { useState } from 'react';
import { OutlineNode, DocumentSection, DocumentType } from '@/lib/generator/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileDown,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { flattenOutlineSections } from '@/lib/generator/engine/outline-builder';

interface ReviewExportStepProps {
  documentType: DocumentType;
  title: string;
  discipline: string;
  institutionName: string;
  citationStyle: string;
  outline: OutlineNode[];
  sections: Record<string, DocumentSection>;
  onBackToEditor: () => void;
}

export function ReviewExportStep({
  documentType,
  title,
  discipline,
  institutionName,
  citationStyle,
  outline,
  sections,
  onBackToEditor,
}: ReviewExportStepProps) {
  const [copied, setCopied] = useState(false);

  const flatSections = flattenOutlineSections(outline);
  const totalWords = flatSections.reduce((sum, s) => {
    return sum + (sections[s.id]?.wordCount || 0);
  }, 0);

  const estimatedPages = Math.max(1, Math.round(totalWords / 300));
  const uncompleted = flatSections.filter((s) => !sections[s.id] || !sections[s.id].contentMarkdown);

  // Compile full document markdown
  const compiledDocument = `# ${title}\n\n**Discipline**: ${discipline}  \n**Institution**: ${institutionName || 'N/A'}  \n**Referencing Standard**: ${citationStyle}  \n**Generated via Scholarverse Co-Authoring Engine**\n\n---\n\n` +
    outline.map((ch) => {
      let chText = `## ${ch.title}\n\n`;
      if (ch.children && ch.children.length > 0) {
        for (const child of ch.children) {
          const s = sections[child.id];
          chText += `### ${child.sectionNumber || ''} ${child.title}\n\n${s?.contentMarkdown || '*(Section pending draft)*'}\n\n`;
        }
      } else {
        const s = sections[ch.id];
        chText += `${s?.contentMarkdown || '*(Section pending draft)*'}\n\n`;
      }
      return chText;
    }).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledDocument);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([compiledDocument], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-scholarverse.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stages 05 & 06 · Coherence Review & Export</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Final document compilation</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            Review the synthesized draft across all chapters, verify completeness, and export to academic formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBackToEditor} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Section Editor</span>
          </Button>
        </div>
      </div>

      {/* Global Health & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/60 p-4">
          <div className="text-xs text-muted-foreground">Total Word Volume</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {totalWords.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">words</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Approx. {estimatedPages} double-spaced pages</div>
        </Card>

        <Card className="border-border/60 bg-card/60 p-4">
          <div className="text-xs text-muted-foreground">Section Completeness</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {flatSections.length - uncompleted.length} / {flatSections.length}
          </div>
          <div className="text-xs mt-0.5">
            {uncompleted.length === 0 ? (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All sections drafted
              </span>
            ) : (
              <span className="text-amber-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {uncompleted.length} sections pending
              </span>
            )}
          </div>
        </Card>

        <Card className="border-border/60 bg-card/60 p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Export Formats</div>
            <div className="text-xs font-semibold text-foreground mt-1">DOCX, Markdown & Print PDF</div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" onClick={handleDownloadMarkdown} className="h-8 text-xs gap-1.5 flex-1">
              <FileDown className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopy} className="h-8 text-xs gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs gap-1.5">
              <Printer className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Full Document Reader / Preview */}
      <Card className="border-border/60 bg-card/80 shadow-md">
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Document Manuscript Preview
            </span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {citationStyle} Standards Applied
          </Badge>
        </div>

        <CardContent className="p-8 max-h-[700px] overflow-y-auto font-serif space-y-6 text-foreground bg-background">
          <div className="border-b border-border/40 pb-6 text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">{title}</h1>
            <p className="text-xs text-muted-foreground font-sans">
              Department of {discipline} · {institutionName || 'Academic Research Report'}
            </p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 leading-relaxed">
            {outline.map((ch) => (
              <div key={ch.id} className="space-y-4 pt-4 border-t border-border/20">
                <h2 className="text-lg font-bold font-sans text-foreground">{ch.title}</h2>
                {ch.children && ch.children.length > 0 ? (
                  ch.children.map((child) => {
                    const s = sections[child.id];
                    return (
                      <div key={child.id} className="space-y-2 pl-4">
                        <h3 className="text-sm font-semibold font-sans text-primary">
                          {child.sectionNumber} {child.title}
                        </h3>
                        {s?.contentMarkdown ? (
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {s.contentMarkdown}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            [This section has not been drafted yet]
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div>
                    {sections[ch.id]?.contentMarkdown ? (
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {sections[ch.id].contentMarkdown}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        [This section has not been drafted yet]
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
