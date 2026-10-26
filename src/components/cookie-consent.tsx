'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented.
    // We run this in a useEffect to ensure it only runs on the client.
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Store the consent and hide the banner
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
        className={cn(
            "fixed bottom-4 right-4 z-[100] w-[calc(100%-2rem)] max-w-md p-6 rounded-2xl shadow-2xl transition-all duration-500",
            "bg-background/80 backdrop-blur-lg border border-border",
            isVisible ? "animate-in slide-in-from-bottom-10 fade-in-0" : "animate-out slide-out-to-bottom-10 fade-out-0"
        )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Cookie className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cookie Consent & Terms</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We use essential cookies to make our site work. By using our site, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
          <Button 
            className="mt-4 w-full"
            onClick={handleAccept}
          >
            Accept and Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
