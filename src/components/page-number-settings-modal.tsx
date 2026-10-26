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
import { Hash } from 'lucide-react';

interface PageNumberSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ReportData;
  setFormData: Dispatch<SetStateAction<ReportData>>;
}

export function PageNumberSettingsModal({
  isOpen,
  onClose,
  formData,
  setFormData,
}: PageNumberSettingsModalProps) {
  const handlePositionChange = (value: ReportData['pageNumberPosition']) => {
    setFormData(prev => ({ ...prev, pageNumberPosition: value }));
  };

  const handleFormatChange = (value: ReportData['pageNumberFormat']) => {
    setFormData(prev => ({ ...prev, pageNumberFormat: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            <DialogTitle className="text-base font-bold">Pagination Formatting</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Customize footer pagination alignment and numeral convention.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="page-number-position" className="text-xs font-semibold">Footer Alignment Position</Label>
            <Select value={formData.pageNumberPosition} onValueChange={handlePositionChange}>
              <SelectTrigger id="page-number-position" className="h-9 text-xs rounded-xl bg-background/60">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-center">Bottom Center (Standard)</SelectItem>
                <SelectItem value="bottom-right">Bottom Right (Thesis Convention)</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="page-number-format" className="text-xs font-semibold">Numeral Notation Format</Label>
            <Select value={formData.pageNumberFormat} onValueChange={handleFormatChange}>
              <SelectTrigger id="page-number-format" className="h-9 text-xs rounded-xl bg-background/60">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Page {page}">Page 1, Page 2...</SelectItem>
                <SelectItem value="{page}">1, 2, 3... (Standard Digits)</SelectItem>
                <SelectItem value="Page {page_roman_lower}">Page i, Page ii...</SelectItem>
                <SelectItem value="{page_roman_lower}">i, ii, iii... (Lower Roman)</SelectItem>
                <SelectItem value="Page {page_roman_upper}">Page I, Page II...</SelectItem>
                <SelectItem value="{page_roman_upper}">I, II, III... (Upper Roman)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
