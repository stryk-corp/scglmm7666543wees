'use client';

import React, { useState } from 'react';
import { OutlineNode, DocumentType } from '@/lib/generator/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Sparkles, Plus, Trash2, ChevronDown, ChevronRight, Layers, FileEdit } from 'lucide-react';

interface OutlineBuilderStepProps {
  documentType: DocumentType;
  title: string;
  outline: OutlineNode[];
  setOutline: React.Dispatch<React.SetStateAction<OutlineNode[]>>;
  onBack: () => void;
  onApprove: () => void;
}

export function OutlineBuilderStep({
  documentType,
  title,
  outline,
  setOutline,
  onBack,
  onApprove,
}: OutlineBuilderStepProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'essay-intro': true,
    'tp-ch1': true,
    'tp-ch2': true,
    'siwes-ch1': true,
    'siwes-ch2': true,
    'siwes-ch3': true,
    'siwes-ch4': true,
  });

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalEstimatedWords = outline.reduce((sum, node) => {
    const nodeWords = node.estimatedWords || 0;
    const childWords = (node.children || []).reduce((cSum, c) => cSum + (c.estimatedWords || 0), 0);
    return sum + (childWords > 0 ? childWords : nodeWords);
  }, 0);

  const handleAddChild = (parentId: string) => {
    if (!newSectionTitle.trim()) return;

    setOutline((prev) =>
      prev.map((node) => {
        if (node.id === parentId) {
          const newChild: OutlineNode = {
            id: `custom-${Date.now()}`,
            title: newSectionTitle.trim(),
            level: 2,
            sectionNumber: `${node.chapterNumber || 1}.${(node.children?.length || 0) + 1}`,
            estimatedWords: 350,
            status: 'not_started',
            purpose: `Investigate and explain ${newSectionTitle.trim()} with supporting scholarly evidence.`,
          };
          return {
            ...node,
            children: [...(node.children || []), newChild],
          };
        }
        return node;
      })
    );

    setNewSectionTitle('');
    setSelectedParentId(null);
  };

  const handleDeleteNode = (id: string) => {
    setOutline((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          children: (n.children || []).filter((c) => c.id !== id),
        }))
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stage 03 · Blueprint Outline</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Review & customize document structure</h2>
          <p className="text-muted-foreground text-sm max-w-xl">
            This outline is your generation contract. Review chapters, add specialized subtopics, or adjust scope
            before locking in the workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card p-3 rounded-xl border border-border/60 shrink-0">
          <Layers className="w-4 h-4 text-primary" />
          <div className="text-xs">
            <span className="font-semibold text-foreground">{totalEstimatedWords.toLocaleString()}</span>
            <span className="text-muted-foreground"> estimated words (~{Math.round(totalEstimatedWords / 300)} pgs)</span>
          </div>
        </div>
      </div>

      {/* Outline Nodes List */}
      <div className="space-y-3">
        {outline.map((chapter) => {
          const isExpanded = !!expandedNodes[chapter.id];
          const hasChildren = chapter.children && chapter.children.length > 0;

          return (
            <Card key={chapter.id} className="border-border/60 bg-card/60 overflow-hidden transition-all">
              <div className="p-4 flex items-center justify-between gap-3 bg-muted/20 border-b border-border/30">
                <div className="flex items-center gap-3 flex-1">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleExpand(chapter.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{chapter.title}</span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      ~{chapter.estimatedWords} words
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 text-primary hover:text-primary"
                    onClick={() => setSelectedParentId(chapter.id)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subtopic</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                    onClick={() => handleDeleteNode(chapter.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Subtopics (Children) */}
              {hasChildren && isExpanded && (
                <div className="p-3 pl-11 space-y-2 bg-background/50">
                  {chapter.children!.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/40 bg-card/40 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          {child.sectionNumber}
                        </span>
                        <span className="text-xs font-medium text-foreground">{child.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({child.estimatedWords} words)
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                        onClick={() => handleDeleteNode(child.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Add Subtopic Input */}
              {selectedParentId === chapter.id && (
                <div className="p-3 pl-11 flex items-center gap-2 bg-primary/5 border-t border-primary/20">
                  <Input
                    placeholder="Enter new subtopic heading..."
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="h-8 text-xs bg-background"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddChild(chapter.id);
                    }}
                  />
                  <Button size="sm" className="h-8 text-xs" onClick={() => handleAddChild(chapter.id)}>
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setSelectedParentId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <Button variant="outline" onClick={onBack} size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Interrogation</span>
        </Button>

        <Button
          onClick={onApprove}
          size="lg"
          className="gap-2 font-semibold shadow-md px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Sparkles className="w-4 h-4" />
          <span>Approve Outline & Enter Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
