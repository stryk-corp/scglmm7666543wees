import type {Metadata} from 'next';
import {createPageMetadata} from '@/lib/seo';

export const metadata: Metadata = createPageMetadata(
  'Privacy Policy',
  'Learn how Scholarverse collects, uses, stores, and protects account and report information.',
  '/privacy',
);

export default function PrivacyLayout({children}: Readonly<{children: React.ReactNode}>) {
  return children;
}