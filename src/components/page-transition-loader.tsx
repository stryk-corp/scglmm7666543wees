'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePageLoading } from '@/context/loading-context';
import Image from 'next/image';

export default function PageTransitionLoader() {
  const { isPageLoading, setIsPageLoading } = usePageLoading();
  const pathname = usePathname();

  useEffect(() => {
    // Hide the loader whenever the pathname changes
    setIsPageLoading(false);
  }, [pathname, setIsPageLoading]);

  if (!isPageLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex h-screen items-center justify-center bg-background/85 backdrop-blur-md transition-opacity">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <Image
            src="/schverse-loader.gif"
            alt="Scholarverse Loading"
            width={112}
            height={112}
            className="object-contain drop-shadow-sm"
            unoptimized
            priority
          />
        </div>
        <p className="text-sm font-semibold tracking-wide text-foreground/80 animate-pulse">
          Loading Scholarverse...
        </p>
      </div>
    </div>
  );
}
