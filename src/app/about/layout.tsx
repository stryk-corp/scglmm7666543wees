import type {Metadata} from 'next';
import {createPageMetadata, SITE_URL} from '@/lib/seo';

const title = 'About Scholarverse and Its Founders';
const description =
  'Meet Scholarverse founder Tobenna Ike and co-founder Uyanna Kingsley Chukwuebuka, learn about their backgrounds, and discover how they jointly developed the platform for Nigerian students.';

export const metadata: Metadata = {
  ...createPageMetadata(title, description, '/about'),
  robots: {
    index: true,
    follow: true,
  },
};

const founderStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE_URL}/about#aboutpage`,
      url: `${SITE_URL}/about`,
      name: title,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-NG',
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Scholarverse',
      url: SITE_URL,
      founder: [
        { '@id': `${SITE_URL}/about#tobenna-ike` },
        { '@id': `${SITE_URL}/about#uyanna-kingsley-chukwuebuka` },
      ],
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/about#tobenna-ike`,
      name: 'Tobenna Ike',
      description:
        'Founder of Scholarverse, Chief Executive Officer of Stryk Corp, software developer, web designer, and author of The Mourning Mother’s Curse. Based in Abuja, Nigeria.',
      jobTitle: 'Founder and Chief Executive Officer',
      worksFor: { '@type': 'Organization', name: 'Stryk Corp' },
      affiliation: { '@type': 'CollegeOrUniversity', name: 'University of Nigeria, Nsukka' },
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdEWCeO-gFWZzwtlWtgd8VnnOcdgLRpD19qAK5Mxe3dw&s=10',
      url: `${SITE_URL}/about`,
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/about#uyanna-kingsley-chukwuebuka`,
      name: 'Uyanna Kingsley Chukwuebuka',
      description:
        'Co-founder of Scholarverse, frontend web developer at Creative Media Concept, and University of Nigeria, Nsukka Mechanical Engineering student pursuing a B.Eng. with the 2028 graduating class.',
      jobTitle: 'Co-Founder and Web Developer',
      worksFor: { '@type': 'Organization', name: 'Creative Media Concept' },
      affiliation: { '@type': 'CollegeOrUniversity', name: 'University of Nigeria, Nsukka' },
      image:
        'https://i.ibb.co/yn1RDz0S/IMG-20261027-WA0010.jpg',
      knowsAbout: ['Frontend development', 'Website design', 'Mechanical engineering'],
      url: `${SITE_URL}/about`,
    },
  ],
};

export default function AboutLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(founderStructuredData).replace(/</g, '\\u003c'),
        }}
      />
      {children}
    </>
  );
}