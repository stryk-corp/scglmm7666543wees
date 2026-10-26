'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  BookOpen,
  FileText,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Award,
  BookMarked,
  Layers,
  CircleDot,
  Check,
  Flame,
  Fingerprint
} from 'lucide-react';

export type AcademicBadgeVariant =
  | 'siwes'
  | 'term_paper'
  | 'essay'
  | 'itf'
  | 'verified'
  | 'humanized'
  | 'academic_level'
  | 'apa_style'
  | 'peer_reviewed'
  | 'plagiarism_safe'
  | 'readiness'
  | 'chapter'
  | 'status'
  | 'standard';

export interface AcademicBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AcademicBadgeVariant;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  withDot?: boolean;
  glow?: boolean;
}

export function AcademicBadge({
  variant = 'standard',
  label,
  size = 'md',
  withDot = false,
  glow = false,
  className,
  children,
  ...props
}: AcademicBadgeProps) {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1 font-mono',
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-2.5 py-1 text-[11px] gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2',
  }[size];

  const dot = (color: string) => (
    <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', color)} />
  );

  switch (variant) {
    case 'siwes':
      return (
        <span
          className={cn(
            'inline-flex items-center font-semibold rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 tracking-wide uppercase shadow-xs transition-colors',
            glow && 'glow-amber',
            sizeClasses,
            className
          )}
          {...props}
        >
          {withDot ? dot('bg-amber-500') : <Briefcase className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />}
          <span className="truncate">{label || children || 'SIWES / IT Practicum'}</span>
        </span>
      );

    case 'term_paper':
      return (
        <span
          className={cn(
            'inline-flex items-center font-semibold rounded-full bg-muted text-foreground border border-border tracking-wide uppercase shadow-xs transition-colors',
            sizeClasses,
            className
          )}
          {...props}
        >
          {withDot ? dot('bg-foreground') : <BookOpen className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
          <span className="truncate">{label || children || 'Scholarly Term Paper'}</span>
        </span>
      );

    case 'essay':
      return (
        <span
          className={cn(
            'inline-flex items-center font-semibold rounded-full bg-muted text-foreground border border-border tracking-wide uppercase shadow-xs transition-colors',
            sizeClasses,
            className
          )}
          {...props}
        >
          {withDot ? dot('bg-foreground') : <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
          <span className="truncate">{label || children || 'Academic Essay'}</span>
        </span>
      );

    case 'itf':
      return (
        <span
          className={cn(
            'inline-flex items-center font-semibold rounded-full bg-primary/10 text-primary border border-primary/25 tracking-wide shadow-xs',
            glow && 'glow-emerald',
            sizeClasses,
            className
          )}
          {...props}
        >
          <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />
          <span className="truncate">{label || children || 'ITF Regulatory Compliant'}</span>
        </span>
      );

    case 'verified':
      return (
        <span
          className={cn(
            'inline-flex items-center font-medium rounded-full bg-primary/10 text-primary border border-primary/20 shadow-xs',
            sizeClasses,
            className
          )}
          {...props}
        >
          <Check className="w-2.5 h-2.5 text-primary stroke-[3] flex-shrink-0" />
          <span className="truncate">{label || children || 'Verified Milestone'}</span>
        </span>
      );

    case 'humanized':
      return (
        <span
          className={cn(
            'inline-flex items-center font-semibold rounded-full bg-primary/10 text-primary border border-primary/25 shadow-xs relative overflow-hidden',
            sizeClasses,
            className
          )}
          {...props}
        >
          <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
          <span className="truncate">{label || children || 'Anti-AI Humanized (Turnitin 0%)'}</span>
        </span>
      );

    case 'academic_level':
      return (
        <span
          className={cn(
            'inline-flex items-center font-medium rounded-full bg-secondary/80 text-foreground border border-border/80 shadow-xs',
            sizeClasses,
            className
          )}
          {...props}
        >
          <GraduationCap className="w-3 h-3 text-primary flex-shrink-0" />
          <span className="truncate">{label || children}</span>
        </span>
      );

    case 'apa_style':
      return (
        <span
          className={cn(
            'inline-flex items-center font-mono font-medium rounded-full bg-card text-foreground border border-border/80 shadow-xs',
            sizeClasses,
            className
          )}
          {...props}
        >
          <BookMarked className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="truncate">{label || children || 'APA 7th Edition'}</span>
        </span>
      );

    case 'peer_reviewed':
      return (
        <span
          className={cn(
            'inline-flex items-center font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-xs',
            sizeClasses,
            className
          )}
          {...props}
        >
          <Award className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span className="truncate">{label || children || 'Scholarly Standard'}</span>
        </span>
      );

    case 'plagiarism_safe':
      return (
        <span
          className={cn(
            'inline-flex items-center font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xs',
            sizeClasses,
            className
          )}
          {...props}
        >
          <Fingerprint className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{label || children || 'Plagiarism Guard'}</span>
        </span>
      );

    case 'chapter':
      return (
        <span
          className={cn(
            'inline-flex items-center font-mono font-semibold rounded-full bg-primary/10 text-primary border border-primary/25',
            sizeClasses,
            className
          )}
          {...props}
        >
          <Layers className="w-2.5 h-2.5 text-primary flex-shrink-0" />
          <span className="truncate">{label || children}</span>
        </span>
      );

    case 'readiness':
      return (
        <span
          className={cn(
            'inline-flex items-center font-mono font-bold rounded-full bg-card border border-border/70 text-foreground',
            sizeClasses,
            className
          )}
          {...props}
        >
          {withDot && dot('bg-emerald-400')}
          <span className="truncate">{label || children}</span>
        </span>
      );

    case 'status':
      return (
        <span
          className={cn(
            'inline-flex items-center font-medium rounded-full bg-muted/60 text-muted-foreground border border-border/60',
            sizeClasses,
            className
          )}
          {...props}
        >
          {withDot && dot('bg-muted-foreground')}
          <span className="truncate">{label || children}</span>
        </span>
      );

    default:
      return (
        <span
          className={cn(
            'inline-flex items-center font-medium rounded-full bg-muted/60 text-muted-foreground border border-border/60 shadow-xs',
            sizeClasses,
            className
          )}
          {...props}
        >
          <span className="truncate">{label || children}</span>
        </span>
      );
  }
}
