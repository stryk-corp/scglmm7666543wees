import type {Metadata} from 'next';
import {createPageMetadata} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata(
  'Terms of Service',
  'Review the terms governing access to and use of the Scholarverse academic report generation service.',
  '/terms',
);

export default function TermsLayout({children}: Readonly<{children: React.ReactNode}>) {
  return children;
}