import type {Metadata} from 'next';

export const SITE_URL = 'https://scholarverse.app';
export const SITE_NAME = 'Scholarverse';

export function createPageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
      type: 'website',
      locale: 'en_NG',
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      title,
      description,
      images: [{url: '/schverse-logo.png', alt: SITE_NAME}],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/schverse-logo.png'],
    },
  };
}