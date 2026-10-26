
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/context/notification-context';
import { Loader2, User, Sparkles } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import Image from 'next/image';
import { addTestimonial } from '@/firebase/firestore';
import { moderateTestimonial } from '@/ai/flows/moderate-testimonial';
import { enhanceTestimonialText } from '@/ai/flows/enhance-testimonial-text';

interface AddTestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageUploadField = ({ label, icon: Icon, onFileSelect, preview }: { label: string, icon: React.ElementType, onFileSelect: (file: File) => void, preview: string | null }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="relative">
                <Input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary transition-colors cursor-pointer">
                    {preview ? (
                        <Image src={preview} alt="Preview" width={100} height={100} className="max-h-full w-auto object-contain rounded" />
                    ) : (
                        <>
                            <Icon className="h-8 w-8" />
                            <span className="mt-2 text-sm">Click to upload</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


export function AddTestimonialDialog({ open, onOpenChange }: AddTestimonialDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [testimonialText, setTestimonialText] = useState('');
  const [authorImage, setAuthorImage] = useState<File | null>(null);
  const [authorPreview, setAuthorPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { showNotification } = useNotification();
  
  const resetForm = () => {
    setTestimonialText('');
    setAuthorImage(null);
    setAuthorPreview(null);
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (file: File) => {
    setAuthorImage(file);
    setAuthorPreview(URL.createObjectURL(file));
  };
  
  const handleEnhanceText = async () => {
    if (!testimonialText.trim()) {
      showNotification({ title: 'No Text', message: 'Please write a testimonial first before enhancing.', type: 'info' });
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhanceTestimonialText({ text: testimonialText });
      setTestimonialText(result.enhancedText);
      showNotification({ title: 'Text Enhanced!', message: 'The AI has improved your testimonial.', type: 'success' });
    } catch (error: any) {
      showNotification({ title: 'Error', message: error.message || 'Could not enhance text.', type: 'error' });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !firestore) {
        showNotification({ title: 'Error', message: 'You must be logged in to submit a testimonial.', type: 'error' });
        return;
    }
    if (testimonialText.length < 3) {
      showNotification({ title: 'Error', message: 'Testimonial must be at least 3 characters long.', type: 'error' });
      return;
    }

    setLoading(true);
    setLoadingMessage('Verifying content...');

    try {
        let authorImageUrl = '';
        if (authorImage) {
            authorImageUrl = await fileToDataUrl(authorImage);
        }

        // Step 1: Moderate content
        const moderationResult = await moderateTestimonial({
            testimonialText,
            authorImageUrl: authorImageUrl || undefined,
        });

        if (!moderationResult.isAppropriate) {
            showNotification({ title: 'Submission Rejected', message: `Your submission was flagged for the following reason: ${moderationResult.reason}`, type: 'error' });
            setLoading(false);
            return;
        }

        // Step 2: Save to Firestore
        setLoadingMessage('Saving testimonial...');
        await addTestimonial(firestore, user, {
            testimonialText,
            authorImageUrl,
        });

        showNotification({ title: 'Success', message: 'Thank you for your testimonial! It has been submitted successfully.', type: 'success' });
        resetForm();
        onOpenChange(false);
      
    } catch (error: any) {
      showNotification({ title: 'Error', message: error.message || 'An unexpected error occurred.', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            Your feedback helps others. Fill out the details below to submit your testimonial.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="testimonialText">Your Testimonial</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEnhanceText}
                disabled={isEnhancing || loading}
              >
                {isEnhancing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Enhance with AI
              </Button>
            </div>
            <Textarea
              id="testimonialText"
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              placeholder="e.g., 'This app was a lifesaver! It saved me so much time...'"
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
             <ImageUploadField label="Your Photo (Optional)" icon={User} onFileSelect={handleFileSelect} preview={authorPreview} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || isEnhancing}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingMessage}
              </>
            ) : 'Submit Testimonial'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
