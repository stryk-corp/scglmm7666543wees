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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Type } from 'lucide-react';

interface FontSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ReportData;
  setFormData: Dispatch<SetStateAction<ReportData>>;
}

export function FontSettingsModal({
  isOpen,
  onClose,
  formData,
  setFormData,
}: FontSettingsModalProps) {
  const handleFontFamilyChange = (value: string) => {
    setFormData(prev => ({ ...prev, fontFamily: value }));
  };

  const handleFontSizeChange = (value: string) => {
    setFormData(prev => ({ ...prev, fontSize: value }));
  };

  const handleLineHeightChange = (value: string) => {
    setFormData(prev => ({ ...prev, lineHeight: value }));
  };
  
  const fontSizes = [9, 10, 11, 12, 14, 16, 18, 20, 24];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            <DialogTitle className="text-base font-bold">Typography &amp; Typesetting</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Adjust the typeface family, base font size, and line pitch for the final document.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="font-family" className="text-xs font-semibold">Scholarly Typeface Family</Label>
            <Select value={formData.fontFamily} onValueChange={handleFontFamilyChange}>
              <SelectTrigger id="font-family" className="h-9 text-xs rounded-xl bg-background/60">
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Times New Roman">Times New Roman (Academic Classic)</SelectItem>
                <SelectItem value="Garamond">Garamond (Scholarly Book Antiqua)</SelectItem>
                <SelectItem value="Georgia">Georgia (Editorial Serif)</SelectItem>
                <SelectItem value="Lora">Lora (Contemporary Serif)</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display (Executive Display)</SelectItem>
                <SelectItem value="Inter">Inter (Modern Clean Sans)</SelectItem>
                <SelectItem value="Roboto">Roboto (Technical Sans)</SelectItem>
                <SelectItem value="Open Sans">Open Sans (Neutral Sans)</SelectItem>
                <SelectItem value="Montserrat">Montserrat (Modern Geometric)</SelectItem>
                <SelectItem value="Arial">Arial (Standard Sans)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="font-size" className="text-xs font-semibold">Body Font Size</Label>
              <Select value={formData.fontSize} onValueChange={handleFontSizeChange}>
                <SelectTrigger id="font-size" className="h-9 text-xs rounded-xl bg-background/60">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map(size => (
                    <SelectItem key={size} value={`${size}pt`}>{size} pt {size === 12 && '(Academic Standard)'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="line-height" className="text-xs font-semibold">Line Pitch Spacing</Label>
              <Select value={formData.lineHeight} onValueChange={handleLineHeightChange}>
                <SelectTrigger id="line-height" className="h-9 text-xs rounded-xl bg-background/60">
                  <SelectValue placeholder="Select spacing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Single Spacing (1.0)</SelectItem>
                  <SelectItem value="1.5">1.5 Lines</SelectItem>
                  <SelectItem value="2">Double Spacing (2.0 - Standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Live Typography Preview Strip */}
          <div className="p-3 rounded-xl border border-border/80 bg-background/60 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Live Type Specimen</span>
            <p
              style={{
                fontFamily: `"${formData.fontFamily}", serif`,
                fontSize: formData.fontSize || '12pt',
                lineHeight: formData.lineHeight || '2',
              }}
              className="text-foreground leading-normal line-clamp-3 text-xs"
            >
              The empirical framework demonstrates significant correlation across institutional variables and workplace performance benchmarks.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
