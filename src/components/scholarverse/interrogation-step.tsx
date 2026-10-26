'use client';

import React from 'react';
import { InquiryQuestion, DocumentType } from '@/lib/generator/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle, Sparkles, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InterrogationStepProps {
  documentType: DocumentType;
  questions: InquiryQuestion[];
  answers: Record<string, string>;
  setAnswer: (fieldKey: string, val: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function InterrogationStep({
  documentType,
  questions,
  answers,
  setAnswer,
  onBack,
  onNext,
}: InterrogationStepProps) {
  // Validate that required questions have answers
  const isComplete = questions.every((q) => {
    if (!q.required) return true;
    const ans = answers[q.fieldKey];
    return typeof ans === 'string' && ans.trim().length > 3;
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage 02 · Contextual Interrogation</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Ground your document with authentic details</h2>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Unlike generic generators that invent facts, Scholarverse interrogates your specific assignment,
          empirical objectives, or industrial training diary to create persistent project memory.
        </p>
      </div>

      {/* Dynamic Questions Form */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const value = answers[q.fieldKey] || '';
          return (
            <Card key={q.id} className="border-border/60 bg-card/60 backdrop-blur-sm transition-all hover:border-border">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                        {idx + 1}
                      </span>
                      <Label className="text-sm font-semibold text-foreground">
                        {q.question} {q.required && <span className="text-red-500">*</span>}
                      </Label>
                    </div>
                    {q.subtext && <p className="text-xs text-muted-foreground pl-7">{q.subtext}</p>}
                  </div>
                  {value.trim().length > 3 && (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="pl-7 pt-1">
                  {q.type === 'textarea' ? (
                    <Textarea
                      rows={3}
                      placeholder={q.placeholder}
                      value={value}
                      onChange={(e) => setAnswer(q.fieldKey, e.target.value)}
                      className="bg-background text-sm resize-y leading-relaxed"
                    />
                  ) : q.type === 'select' && q.options ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(q.fieldKey, opt)}
                          className={`p-3 text-left rounded-lg border text-xs transition-all ${
                            value === opt
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border/60 hover:border-border text-foreground bg-background'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Input
                      placeholder={q.placeholder}
                      value={value}
                      onChange={(e) => setAnswer(q.fieldKey, e.target.value)}
                      className="bg-background text-sm h-10"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <Button variant="outline" onClick={onBack} size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Configuration</span>
        </Button>

        <Button
          onClick={onNext}
          disabled={!isComplete}
          size="lg"
          className="gap-2 font-semibold shadow-md px-6"
        >
          <span>Continue to Stage 03: Build Outline</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
