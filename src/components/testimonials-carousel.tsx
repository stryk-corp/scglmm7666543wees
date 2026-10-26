
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Testimonial {
  id: string;
  authorName: string;
  university: string;
  testimonialText: string;
  authorImageUrl?: string;
  createdAt: Timestamp;
}


export function TestimonialsCarousel() {
  const firestore = useFirestore();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const testimonialsRef = collection(firestore, 'testimonials');
    const q = query(testimonialsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTestimonials = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
        setTestimonials(fetchedTestimonials);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching testimonials for carousel: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);


  if (loading) {
    return (
        <div className="flex justify-center gap-8">
            <Skeleton className="h-[400px] w-full md:w-1/3 rounded-2xl" />
            <Skeleton className="h-[400px] w-full md:w-1/3 rounded-2xl hidden md:block" />
            <Skeleton className="h-[400px] w-full md:w-1/3 rounded-2xl hidden lg:block" />
        </div>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't render the section if there are no testimonials
  }

  return (
    <Carousel
      className="w-full max-w-4xl mx-auto"
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: true,
        }),
      ]}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {testimonials.map((testimonial) => (
          <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
              <div className="relative group overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col text-center h-full">
                {testimonial.authorImageUrl && (
                    <div className="relative w-full aspect-[4/3] flex-shrink-0">
                       <Image
                        src={testimonial.authorImageUrl}
                        alt={`Photo of ${testimonial.authorName}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="student report"
                        className="transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                    <blockquote className="text-foreground/90 italic flex-grow text-sm sm:text-base leading-relaxed">"{testimonial.testimonialText}"</blockquote>
                    <cite className="mt-4 not-italic text-sm font-bold text-foreground">{testimonial.authorName}</cite>
                    <p className="text-xs font-medium text-muted-foreground">{testimonial.university}</p>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
