'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { ReportData } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  RadioGroup, RadioGroupItem
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import {
  FileText,
  Ruler,
  Hash,
  Book,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Layers,
  Minus,
  Plus,
} from 'lucide-react';
import { Switch } from './ui/switch';
import { AcademicBadge } from './ui/academic-badge';
import { cn } from '@/lib/utils';
import { getDocumentPageLimits, getValidPageCount } from '@/lib/config';

interface ReportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ReportData;
  setFormData: Dispatch<SetStateAction<ReportData>>;
  onFontSettingsClick: () => void;
  onMarginSettingsClick: () => void;
  onPageNumberSettingsClick: () => void;
}

export function ReportSettingsModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onFontSettingsClick,
  onMarginSettingsClick,
  onPageNumberSettingsClick,
}: ReportSettingsModalProps) {
  const docType = formData.documentType || 'term_paper';
  const pageLimits = getDocumentPageLimits(docType);
  const targetPageCount = getValidPageCount(docType, formData.targetPageCount);

  const handlePageCountChange = (value: number) => {
    let bounded = value;
    if (bounded < pageLimits.min) bounded = pageLimits.min;
    if (bounded > pageLimits.max) bounded = pageLimits.max;
    setFormData(prev => ({ ...prev, targetPageCount: bounded }));
  };

  const handleAlignmentChange = (value: 'left' | 'center' | 'justify') => {
    setFormData(prev => ({ ...prev, textAlign: value }));
  };

  const handlePageNumberEnabledChange = (value: string) => {
    setFormData(prev => ({ ...prev, pageNumberEnabled: value === 'true' }));
  };
  
  const handleReferencesEnabledChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, referencesEnabled: checked }));
  };
  
  const handleReferenceStyleChange = (value: ReportData['referenceStyle']) => {
    setFormData(prev => ({ ...prev, referenceStyle: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <DialogTitle className="text-base font-bold">Document Formatting &amp; Engine Settings</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure typographical alignment, page pagination, margins, and scholarly citation style.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-5">
          {/* Target Document Page Count Segment */}
          <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-card/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <Label className="text-xs font-semibold">Target Document Length</Label>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                Min {pageLimits.min} Pages
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Scholarverse strictly budgets word count and page breaks so your printout does not exceed this target.
            </p>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={targetPageCount <= pageLimits.min}
                  onClick={() => handlePageCountChange(targetPageCount - 1)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>

                <div className="px-3 py-1 rounded-lg border border-primary/30 bg-primary/5 min-w-[4.5rem] text-center font-mono font-bold text-sm text-foreground">
                  {targetPageCount} pgs
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={targetPageCount >= pageLimits.max}
                  onClick={() => handlePageCountChange(targetPageCount + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                {[pageLimits.min, pageLimits.min + 3, pageLimits.min + 5].map((pages) => (
                  <button
                    key={pages}
                    type="button"
                    onClick={() => handlePageCountChange(pages)}
                    className={cn(
                      'px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors border',
                      targetPageCount === pages
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground border-border/50'
                    )}
                  >
                    {pages}p
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alignment Segment */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Content Text Alignment</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'left' as const, label: 'Left', icon: AlignLeft },
                { id: 'center' as const, label: 'Center', icon: AlignCenter },
                { id: 'justify' as const, label: 'Justified', icon: AlignJustify },
              ].map(item => {
                const isSelected = formData.textAlign === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAlignmentChange(item.id)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary shadow-xs glow-sapphire'
                        : 'bg-card/50 border-border/70 text-muted-foreground hover:bg-card hover:text-foreground'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Numbering */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Page Numbering Engine</Label>
              <AcademicBadge size="xs" variant={formData.pageNumberEnabled ? 'verified' : 'standard'}>
                {formData.pageNumberEnabled ? 'Enabled' : 'Disabled'}
              </AcademicBadge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePageNumberEnabledChange('true')}
                className={cn(
                  'py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center',
                  formData.pageNumberEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-xs'
                    : 'bg-card/50 border-border/70 text-muted-foreground hover:bg-card'
                )}
              >
                Page Numbers On
              </button>
              <button
                type="button"
                onClick={() => handlePageNumberEnabledChange('false')}
                className={cn(
                  'py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center',
                  !formData.pageNumberEnabled
                    ? 'bg-card border-border text-foreground shadow-xs'
                    : 'bg-card/50 border-border/70 text-muted-foreground hover:bg-card'
                )}
              >
                Page Numbers Off
              </button>
            </div>
          </div>
          
          {/* References Configuration Card */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-card/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-amber-400" />
                  <Label htmlFor="references-enabled" className="text-xs font-semibold">
                    Bibliographic References Section
                  </Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Generates an institutional bibliography list at the conclusion of the work.
                </p>
              </div>
              <Switch
                id="references-enabled"
                checked={formData.referencesEnabled}
                onCheckedChange={handleReferencesEnabledChange}
              />
            </div>

            {formData.referencesEnabled && (
              <div className="space-y-1.5 border-t border-border/50 pt-2.5">
                <Label htmlFor="reference-style" className="text-xs font-medium text-muted-foreground">
                  Scholarly Citation Standard
                </Label>
                <Select value={formData.referenceStyle} onValueChange={handleReferenceStyleChange}>
                  <SelectTrigger id="reference-style" className="h-9 text-xs rounded-lg bg-background/60">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APA">APA 7th Edition (Standard)</SelectItem>
                    <SelectItem value="MLA">MLA 9th Edition</SelectItem>
                    <SelectItem value="Chicago">Chicago Manual of Style</SelectItem>
                    <SelectItem value="Harvard">Harvard Referencing System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Sub-modals Action Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onFontSettingsClick} className="gap-2 text-xs h-9">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Typography Settings</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onMarginSettingsClick} className="gap-2 text-xs h-9">
              <Ruler className="w-3.5 h-3.5 text-primary" />
              <span>Margin Settings</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPageNumberSettingsClick}
              className="sm:col-span-2 gap-2 text-xs h-9"
              disabled={!formData.pageNumberEnabled}
            >
              <Hash className="w-3.5 h-3.5 text-primary" />
              <span>Pagination Placement &amp; Format</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
