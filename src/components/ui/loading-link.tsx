'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { usePageLoading } from '@/context/loading-context';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LoadingLinkProps = LinkProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children: React.ReactNode;
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
};

export const LoadingLink = React.forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  ({ onClick, children, variant, size, className, ...props }, ref) => {
    const { setIsPageLoading } = usePageLoading();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      setIsPageLoading(true);
      if (onClick) {
        onClick(e);
      }
    };
    
    // If a variant is provided, render as a button-styled link
    if (variant) {
      return (
        <Button asChild variant={variant} size={size} className={className}>
          <Link ref={ref} onClick={handleClick} {...props}>
            {children}
          </Link>
        </Button>
      );
    }

    // Otherwise, render a regular link
    return (
      <Link ref={ref} onClick={handleClick} className={className} {...props}>
        {children}
      </Link>
    );
  }
);

LoadingLink.displayName = 'LoadingLink';
