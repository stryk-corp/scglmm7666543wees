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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Ruler } from 'lucide-react';

interface MarginSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ReportData;
  setFormData: Dispatch<SetStateAction<ReportData>>;
}

export function MarginSettingsModal({
  isOpen,
  onClose,
  formData,
  setFormData,
}: MarginSettingsModalProps) {
  const handleMarginInputChange = (side: 'top' | 'bottom' | 'left' | 'right', value: string) => {
    const key = `margin${side.charAt(0).toUpperCase() + side.slice(1)}` as keyof ReportData;
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyPreset = (top: string, right: string, bottom: string, left: string) => {
    setFormData(prev => ({
      ...prev,
      marginTop: top,
      marginRight: right,
      marginBottom: bottom,
      marginLeft: left,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" />
            <DialogTitle className="text-base font-bold">Page Margins &amp; Print Geometry</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Set custom boundary distances for physical page prints and PDF generation.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Standard Presets</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('1in', '1in', '1in', '1.25in')}
                className="py-1.5 px-2 rounded-lg border border-primary/50 bg-primary/10 hover:bg-primary/15 text-[11px] font-semibold text-primary transition-colors text-center"
              >
                Academic (1.25&quot; L)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('1in', '1in', '1in', '1in')}
                className="py-1.5 px-2 rounded-lg border border-border/70 bg-card/60 hover:bg-card text-[11px] font-semibold text-foreground transition-colors text-center"
              >
                APA (1&quot;)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('1in', '1in', '1in', '1.5in')}
                className="py-1.5 px-2 rounded-lg border border-border/70 bg-card/60 hover:bg-card text-[11px] font-semibold text-foreground transition-colors text-center"
              >
                Thesis (1.5&quot; L)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('0.75in', '0.75in', '0.75in', '0.75in')}
                className="py-1.5 px-2 rounded-lg border border-border/70 bg-card/60 hover:bg-card text-[11px] font-semibold text-foreground transition-colors text-center"
              >
                Compact (0.75&quot;)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Custom Margin Dimensions</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="margin-top" className="text-[11px] text-muted-foreground font-mono">Top Margin</Label>
                <Input id="margin-top" value={formData.marginTop} onChange={(e) => handleMarginInputChange('top', e.target.value)} placeholder="e.g., 1in" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="margin-bottom" className="text-[11px] text-muted-foreground font-mono">Bottom Margin</Label>
                <Input id="margin-bottom" value={formData.marginBottom} onChange={(e) => handleMarginInputChange('bottom', e.target.value)} placeholder="e.g., 1in" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="margin-left" className="text-[11px] text-muted-foreground font-mono">Left (Gutter)</Label>
                <Input id="margin-left" value={formData.marginLeft} onChange={(e) => handleMarginInputChange('left', e.target.value)} placeholder="e.g., 1in" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="margin-right" className="text-[11px] text-muted-foreground font-mono">Right Margin</Label>
                <Input id="margin-right" value={formData.marginRight} onChange={(e) => handleMarginInputChange('right', e.target.value)} placeholder="e.g., 1in" className="h-9 text-xs" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
