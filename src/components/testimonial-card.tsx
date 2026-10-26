'use client';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  id: string;
  authorName: string;
  university: string;
  testimonialText: string;
  authorImageUrl?: string;
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      {testimonial.authorImageUrl && (
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={testimonial.authorImageUrl}
            alt={`Photo of ${testimonial.authorName}`}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
            data-ai-hint="student report"
          />
        </div>
      )}
      <CardContent className="p-6 flex flex-col flex-grow">
        <blockquote className="text-foreground/90 italic flex-grow mb-4 leading-relaxed text-sm sm:text-base">
          "{testimonial.testimonialText}"
        </blockquote>
        <div className="mt-auto pt-2 border-t border-border/50">
           <p className="font-bold text-foreground">{testimonial.authorName}</p>
           <p className="text-xs text-muted-foreground font-medium">{testimonial.university}</p>
        </div>
      </CardContent>
    </Card>
  );
}
