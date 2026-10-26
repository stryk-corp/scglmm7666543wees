'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
// Use a regular img for better print/PDF behavior (avoids absolute/fill positioning issues)
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ImageSelectorProps {
  images: string[];
  caption: string;
  onImagesChange: (images: string[]) => void;
  onCaptionChange: (caption: string) => void;
  maxImages?: number;
  figurePrefix?: string;
}

export function ImageSelector({
  images,
  caption,
  onImagesChange,
  onCaptionChange,
  maxImages = 3,
  figurePrefix = '1.1',
}: ImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = e.target?.result as string;
        if (editingIndex !== null) {
          // Replace existing image
          const updatedImages = [...images];
          updatedImages[editingIndex] = newImage;
          onImagesChange(updatedImages);
          setEditingIndex(null);
        } else {
          // Add new image
          onImagesChange([...images, newImage]);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddClick = () => {
    setEditingIndex(null);
    fileInputRef.current?.click();
  };

  const handleImageClick = (index: number) => {
    setEditingIndex(index);
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the image click
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };


  return (
    <div className={cn('my-4', images.length === 0 && 'image-selector-empty')}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {images.map((src, index) => (
            <div key={index} className="group relative">
                <button
                onClick={() => handleImageClick(index)}
                className="image-selector-frame w-full border-2 border-dashed rounded-lg flex items-center text-muted-foreground hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring relative"
                >
                <img
                  src={src}
                  alt={`Attachment image ${index + 1}`}
                  className="rounded-lg w-full"
                />
                </button>
                <button
                    onClick={(e) => handleRemoveImage(index, e)}
                    className="image-selector-ui absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label="Remove image"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            ))}
            {images.length < maxImages && (
            <div className="add-image-container image-selector-ui text-center">
                <button
                    onClick={handleAddClick}
                    className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Add new image"
                >
                    <Plus className="w-8 h-8" />
                    <span>Add Image</span>
                </button>
            </div>
            )}
        </div>
      </div>

       {images.length > 0 && (
         <div className="mt-4 text-center">
            <p className="font-bold text-sm">
                Figure {figurePrefix}:{' '}
                <Input 
                    type="text"
                    value={caption}
                    onChange={(e) => onCaptionChange(e.target.value)}
                    placeholder="Enter caption"
                    className="editable-caption mt-1 h-8 text-sm font-bold inline-block w-auto max-w-full"
                />
                <span className="printable-caption">{caption}</span>
            </p>
        </div>
      )}
    </div>
  );
}
