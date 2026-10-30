import type {Metadata} from 'next';
import {createPageMetadata, SITE_URL} from '@/lib/seo';
import {REPORT_EXPIRATION_DAYS} from '@/lib/config';

const title = 'About Scholarverse and Its Founders';
const description =
  'Meet Scholarverse founder Tobenna Ike and co-founder Uyanna Kingsley Chukwuebuka. Learn how the platform helps Nigerian students write SIWES reports and term papers with AI, correct formatting, cover pages, and print preview.';

const PAGE_URL = `${SITE_URL}/about`;
const LAST_UPDATED = '2026-10-30';

export const metadata: Metadata = {
  ...createPageMetadata(title, description, '/about'),
  keywords: [
    'Scholarverse',
    'About Scholarverse',
    'Scholarverse founders',
    'Tobenna Ike',
    'Uyanna Kingsley Chukwuebuka',
    'SIWES report generator',
    'SIWES report writing',
    'AI SIWES report',
    'term paper generator Nigeria',
    'Nigerian university report formatting',
    'UNN cover page',
    'organogram generator',
    'Stryk Corp',
  ],
  authors: [{name: 'Tobenna Ike'}, {name: 'Uyanna Kingsley Chukwuebuka'}],
  creator: 'Scholarverse',
  publisher: 'Scholarverse',
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
};

/* ------------------------------------------------------------------ */
/* FAQ content for FAQPage rich results (must mirror the visible FAQ)  */
/* ------------------------------------------------------------------ */
const faqEntries = [
  {
    q: 'What is Scholarverse?',
    a: 'Scholarverse (also known as SIWES AI Pro) is a web application that helps Nigerian tertiary students produce professionally formatted SIWES reports and term papers. It combines AI-assisted content generation, Nigerian university cover pages, organogram diagrams, and a real-time print preview.',
  },
  {
    q: 'Who built Scholarverse?',
    a: 'Scholarverse was jointly developed by founder Tobenna Ike, a software developer, web designer and author based in Abuja, Nigeria, and co-founder Uyanna Kingsley Chukwuebuka, a web developer and Mechanical Engineering student at the University of Nigeria, Nsukka.',
  },
  {
    q: 'How does the AI content generation work?',
    a: 'The AI uses the details you provide, such as your field of study, skills learned, and company information, to generate relevant, coherent content for sections like the abstract, acknowledgement and technical chapters. The more detail you provide, the better the output.',
  },
  {
    q: 'Which report types does Scholarverse support?',
    a: 'Scholarverse supports two modes: SIWES (Students Industrial Work Experience Scheme) reports and general term papers.',
  },
  {
    q: 'Does it support my university’s formatting?',
    a: 'Scholarverse includes cover pages for the University of Nigeria, Nsukka (UNN) and other Nigerian universities, and handles margins, Roman numeral front-matter numbering and structural layout automatically. Always confirm the final layout against your department’s guidelines.',
  },
  {
    q: 'Can I edit the AI-generated content?',
    a: 'Yes. Every section is editable directly in the form. You can regenerate sections, make manual tweaks and customise the report until you are satisfied, all before you pay for the final download.',
  },
  {
    q: 'Can Scholarverse generate an organogram?',
    a: 'Yes. Scholarverse can produce an organogram diagram of your host organisation instantly from the structure you describe, ready to place in your report.',
  },
  {
    q: 'Is my data and payment information secure?',
    a: 'Yes. Personal and report data is stored on industry-standard cloud infrastructure. Payments are processed through Paystack, a leading secure payment gateway in Africa. Scholarverse does not store your card details on its servers.',
  },
  {
    q: 'Why is there a fee to download the report?',
    a: 'The fee covers the cost of running the AI models that generate your report, server maintenance, and continuous improvement of the service. The goal is to stay affordable for students while keeping the tool reliable and high quality.',
  },
  {
    q: 'Can I get a refund?',
    a: `Because of the nature of digital goods and the costs of AI generation, refunds are not offered once a report has been finalised and purchased. You can preview and edit your report as many times as you like before paying. After purchase, reports are available for download for ${REPORT_EXPIRATION_DAYS} days.`,
  },
  {
    q: 'Will the AI write my whole report for me?',
    a: 'Scholarverse is a collaborative tool. It drafts and formats, but your own experience and details drive the content, and you should review and personalise every section so the report truthfully reflects your work.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Scholarverse',
      alternateName: 'SIWES AI Pro',
      inLanguage: 'en-NG',
      publisher: {'@id': `${SITE_URL}/#organization`},
    },
    {
      '@type': ['AboutPage', 'WebPage'],
      '@id': `${PAGE_URL}#aboutpage`,
      url: PAGE_URL,
      name: title,
      description,
      inLanguage: 'en-NG',
      dateModified: LAST_UPDATED,
      isPartOf: {'@id': `${SITE_URL}/#website`},
      about: {'@id': `${SITE_URL}/#organization`},
      mainEntity: {'@id': `${SITE_URL}/#organization`},
      breadcrumb: {'@id': `${PAGE_URL}#breadcrumb`},
      primaryImageOfPage: {'@type': 'ImageObject', url: `${SITE_URL}/schverse-logo.png`},
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL},
        {'@type': 'ListItem', position: 2, name: 'About', item: PAGE_URL},
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Scholarverse',
      alternateName: 'SIWES AI Pro',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/schverse-logo.png`,
        width: 512,
        height: 512,
      },
      description:
        'Scholarverse helps Nigerian tertiary students write professionally formatted SIWES reports and term papers with AI-assisted content, university cover pages, organogram diagrams and real-time print preview.',
      areaServed: {'@type': 'Country', name: 'Nigeria'},
      audience: {'@type': 'EducationalAudience', educationalRole: 'student'},
      knowsAbout: [
        'SIWES report writing',
        'Term paper writing',
        'Academic report formatting',
        'Nigerian university cover pages',
        'Organogram diagrams',
      ],
      foundingDate: '2026',
      founder: [
        {'@id': `${PAGE_URL}#tobenna-ike`},
        {'@id': `${PAGE_URL}#uyanna-kingsley-chukwuebuka`},
      ],
    },
    {
      '@type': 'Person',
      '@id': `${PAGE_URL}#tobenna-ike`,
      name: 'Tobenna Ike',
      description:
        'Founder of Scholarverse, Chief Executive Officer of Stryk Corp, software developer, web designer, and author of The Mourning Mother’s Curse. Based in Abuja, Nigeria.',
      jobTitle: 'Founder and Chief Executive Officer',
      worksFor: {'@type': 'Organization', name: 'Stryk Corp'},
      affiliation: {'@type': 'CollegeOrUniversity', name: 'University of Nigeria, Nsukka'},
      alumniOf: {'@type': 'CollegeOrUniversity', name: 'University of Nigeria, Nsukka'},
      homeLocation: {
        '@type': 'Place',
        address: {'@type': 'PostalAddress', addressLocality: 'Abuja', addressCountry: 'NG'},
      },
      knowsAbout: ['Software development', 'Web design', 'Creative writing'],
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdEWCeO-gFWZzwtlWtgd8VnnOcdgLRpD19qAK5Mxe3dw&s=10',
      url: PAGE_URL,
    },
    {
      '@type': 'Book',
      '@id': `${PAGE_URL}#the-mourning-mothers-curse`,
      name: 'The Mourning Mother’s Curse',
      author: {'@id': `${PAGE_URL}#tobenna-ike`},
    },
    {
      '@type': 'Person',
      '@id': `${PAGE_URL}#uyanna-kingsley-chukwuebuka`,
      name: 'Uyanna Kingsley Chukwuebuka',
      description:
        'Co-founder of Scholarverse, frontend web developer at Creative Media Concept, and University of Nigeria, Nsukka Mechanical Engineering student pursuing a B.Eng. with the 2028 graduating class.',
      jobTitle: 'Co-Founder and Web Developer',
      worksFor: {'@type': 'Organization', name: 'Creative Media Concept'},
      affiliation: {'@type': 'CollegeOrUniversity', name: 'University of Nigeria, Nsukka'},
      knowsAbout: [
        'Frontend development',
        'Website design',
        'Layout customization',
        'Mechanical engineering',
      ],
      image: 'https://i.ibb.co/yn1RDz0S/IMG-20261027-WA0010.jpg',
      url: PAGE_URL,
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      url: PAGE_URL,
      inLanguage: 'en-NG',
      mainEntity: faqEntries.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {'@type': 'Answer', text: f.a},
      })),
    },
  ],
};

export default function AboutLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      {children}
    </>
  );
}
