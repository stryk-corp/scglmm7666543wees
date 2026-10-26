'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ReportData } from '@/lib/types';
import type { CoverThemeMeta } from './cover-page';
import { CoverPage } from './cover-page';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface CoverPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  themes: CoverThemeMeta[];
  selectedThemeId: string;
  initialThemeId?: string;
  onSelectTheme: (themeId: string) => void;
  formData: ReportData;
}

export function CoverPreviewModal({
  isOpen,
  onClose,
  themes,
  selectedThemeId,
  initialThemeId,
  onSelectTheme,
  formData,
}: CoverPreviewModalProps) {
  // Find index of the initial theme or default to 0
  const findIndexForId = useCallback(
    (id?: string) => {
      if (!id || themes.length === 0) return 0;
      const idx = themes.findIndex((t) => t.id === id);
      return idx >= 0 ? idx : 0;
    },
    [themes]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Sync index whenever modal opens or initialThemeId changes
  useEffect(() => {
    if (isOpen) {
      const idx = findIndexForId(initialThemeId || selectedThemeId);
      setCurrentIndex(idx);
      setSlideDirection(null);
    }
  }, [isOpen, initialThemeId, selectedThemeId, findIndexForId]);

  const currentTheme = themes[currentIndex] || themes[0];
  const isSelected = currentTheme?.id === selectedThemeId;

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (themes.length <= 1) return;
    setSlideDirection('right');
    setCurrentIndex((prev) => (prev + 1) % themes.length);
  }, [themes.length]);

  const handlePrev = useCallback(() => {
    if (themes.length <= 1) return;
    setSlideDirection('left');
    setCurrentIndex((prev) => (prev - 1 + themes.length) % themes.length);
  }, [themes.length]);

  const handleSelectCurrent = () => {
    if (currentTheme) {
      onSelectTheme(currentTheme.id);
      onClose();
    }
  };

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev]);

  // Touch Swipe Gesture Detection
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const minSwipeDistance = 45; // Minimum px for swipe trigger

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    // Check if horizontal swipe dominates vertical scroll
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swiped Left -> View Next
        handleNext();
      } else {
        // Swiped Right -> View Previous
        handlePrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (!isOpen || !currentTheme) return null;

  // Prepare formData preview clone with active preview theme
  const previewFormData: ReportData = {
    ...formData,
    coverTheme: currentTheme.id,
  };

  const docTypeLabel =
    formData.documentType === 'term_paper'
      ? 'Term Paper'
      : formData.documentType === 'essay'
      ? 'Academic Essay'
      : 'SIWES Report';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] h-[92vh] max-h-[95vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-md border-border/80 shadow-2xl">
        {/* Modal Top Bar */}
        <DialogHeader className="p-4 sm:px-6 border-b border-border/60 bg-muted/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider">
                  {docTypeLabel}
                </Badge>
                {currentTheme.badge && (
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    {currentTheme.badge}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground font-medium">
                  {currentIndex + 1} of {themes.length}
                </span>
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {currentTheme.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground line-clamp-1">{currentTheme.description}</p>
            </div>

            {/* Action Button: Use This Theme */}
            <div className="flex items-center gap-2">
              {isSelected ? (
                <Button variant="secondary" size="sm" disabled className="gap-1.5 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Currently Selected</span>
                </Button>
              ) : (
                <Button
                  onClick={handleSelectCurrent}
                  size="sm"
                  className="gap-1.5 text-xs font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Check className="w-4 h-4" />
                  <span>Use This Theme</span>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Modal Interactive Preview Area */}
        <div
          className="relative flex-1 overflow-hidden bg-muted/20 flex items-center justify-center p-3 sm:p-6 select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Desktop/Tablet Floating Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous theme"
            className="absolute left-2 sm:left-4 z-30 p-2.5 rounded-full bg-background/80 hover:bg-background border border-border/60 shadow-lg text-foreground transition-all hover:scale-105 active:scale-95 focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next theme"
            className="absolute right-2 sm:right-4 z-30 p-2.5 rounded-full bg-background/80 hover:bg-background border border-border/60 shadow-lg text-foreground transition-all hover:scale-105 active:scale-95 focus:outline-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Swipe Hint on Mobile */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none sm:hidden">
            <span className="text-[10px] font-medium bg-background/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-border/40 text-muted-foreground shadow-xs">
              👈 Swipe left or right 👉
            </span>
          </div>

          {/* Document Cover Container */}
          <div className="w-full h-full max-w-[620px] overflow-y-auto rounded-lg shadow-2xl border border-border/80 bg-card p-4 sm:p-6 transition-all duration-300">
            <CoverPage formData={previewFormData} />
          </div>
        </div>

        {/* Modal Bottom Controls & Dot Pagination */}
        <div className="p-3 sm:px-6 border-t border-border/60 bg-muted/30 flex-shrink-0 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev Cover</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <span className="hidden sm:inline">Next Cover</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Dot Pagination Navigator */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none px-2 py-1">
            {themes.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSlideDirection(idx > currentIndex ? 'right' : 'left');
                  setCurrentIndex(idx);
                }}
                title={t.name}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-border hover:bg-muted-foreground/40'
                }`}
              />
            ))}
          </div>

          {/* Quick Select / Done Button */}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
