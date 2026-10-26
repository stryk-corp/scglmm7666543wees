
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, UserCircle, MessageSquarePlus } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { TestimonialCard } from '@/components/testimonial-card';
import { AddTestimonialDialog } from '@/components/add-testimonial-dialog';

interface Testimonial {
  id: string;
  authorName: string;
  university: string;
  testimonialText: string;
  authorImageUrl?: string;
  createdAt: Timestamp;
}

export default function TestimonialsPage() {
    const firestore = useFirestore();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);
        const testimonialsRef = collection(firestore, 'testimonials');
        const q = query(testimonialsRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTestimonials = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Testimonial));
            setTestimonials(fetchedTestimonials);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching testimonials: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);
    

  return (
    <>
      <AddTestimonialDialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen} />
      <div className="min-h-screen text-foreground font-body bg-background relative">
        <AnimatedBackground />
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-12">
          
          <Card className="mb-8 bg-card border-border shadow-md">
              <CardHeader className="text-center p-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                       <Image src="/schverse-logo.png" alt="Scholarverse Logo" width={48} height={48} className="rounded-xl object-contain p-1 border border-border shadow-xs"/>
                      <CardTitle className="text-3xl sm:text-4xl font-headline font-bold text-foreground">What Our Users Say</CardTitle>
                  </div>
                  <CardDescription className="text-base sm:text-lg text-muted-foreground font-normal">
                      Real stories from students across Nigerian universities who used Scholarverse.
                  </CardDescription>
              </CardHeader>
          </Card>

          <Card className="bg-card border-border shadow-md">
              <CardContent className="p-6 md:p-10 space-y-12">
                  {/* Testimonials */}
                  <div className="space-y-6">
                       <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-4">
                                <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-xs">
                                    <UserCircle size={24}/>
                                </div>
                                <h2 className="text-2xl font-headline font-semibold border-b-0 pb-0 text-foreground">Success Stories</h2>
                           </div>
                           <Button onClick={() => setIsTestimonialDialogOpen(true)}>
                                <MessageSquarePlus className="mr-2 h-4 w-4" />
                                Add Your Story
                            </Button>
                      </div>

                      {loading ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <Skeleton className="h-96 w-full rounded-lg" />
                              <Skeleton className="h-96 w-full rounded-lg" />
                          </div>
                      ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {testimonials.map(testimonial => (
                                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                              ))}
                          </div>
                      )}
                       {(!loading && testimonials.length === 0) && (
                          <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-border rounded-xl">
                            <p className="mb-4 font-medium">No success stories to show yet. Be the first!</p>
                            <Button onClick={() => setIsTestimonialDialogOpen(true)}>
                              <MessageSquarePlus className="mr-2 h-4 w-4" />
                              Add Your Testimonial
                            </Button>
                          </div>
                       )}
                  </div>

                  <div className="text-center pt-8">
                      <Link href="/" passHref>
                          <Button variant="outline" className="border-border hover:bg-muted text-foreground">
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Back to Home
                          </Button>
                      </Link>
                  </div>
              </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
