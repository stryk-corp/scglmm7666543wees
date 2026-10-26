import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { NotificationProvider } from '@/context/notification-context';
import { LoadingProvider } from '@/context/loading-context';
import PageTransitionLoader from '@/components/page-transition-loader';
import { CookieConsent } from '@/components/cookie-consent';

export const metadata: Metadata = {
  metadataBase: new URL('https://scholarverse.app'),
  title: {
    default: 'Scholarverse | AI-Powered Academic & SIWES Report Generator',
    template: '%s | Scholarverse',
  },
  description: 'Generate professional SIWES reports, academic term papers, and essays instantly using AI. Scholarverse provides fast, authentic, university-standard report generation for Nigerian tertiary institutions.',
  applicationName: 'Scholarverse',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: '/',
    siteName: 'Scholarverse',
    title: 'Scholarverse | AI-Powered Academic & SIWES Report Generator',
    description: 'Generate professional SIWES reports, academic term papers, and essays for Nigerian tertiary institutions.',
    images: [{ url: '/schverse-logo.png', alt: 'Scholarverse' }],
  },
  twitter: {
    card: 'summary',
    title: 'Scholarverse | AI-Powered Academic & SIWES Report Generator',
    description: 'Generate professional SIWES reports, academic term papers, and essays for Nigerian tertiary institutions.',
    images: ['/schverse-logo.png'],
  },
  icons: {
    icon: '/schverse-logo.png',
    shortcut: '/schverse-logo.png',
    apple: '/schverse-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://scholarverse.app/#organization',
        name: 'Scholarverse',
        url: 'https://scholarverse.app/',
        logo: 'https://scholarverse.app/schverse-logo.png',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://scholarverse.app/#website',
        name: 'Scholarverse',
        url: 'https://scholarverse.app/',
        publisher: { '@id': 'https://scholarverse.app/#organization' },
        inLanguage: 'en-NG',
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&family=Times+New+Roman:ital,wght@0,400;0,700;1,400&family=Arial:wght@400;700&family=Verdana:wght@400;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Montserrat:wght@400;500;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Georgia:wght@400;700&family=Garamond:wght@400;700&family=Helvetica:wght@400;700&family=Poppins:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/schverse-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/schverse-logo.png" />
      </head>
      <body className={cn('font-body antialiased')}>
        <FirebaseClientProvider>
          <NotificationProvider>
            <LoadingProvider>
              <PageTransitionLoader />
              {children}
              <CookieConsent />
            </LoadingProvider>
          </NotificationProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
