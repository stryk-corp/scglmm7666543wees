import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ServiceLandingPageProps {
  path: string;
  title: string;
  description: string;
  heading: string;
  introduction: string;
  benefitsHeading: string;
  benefits: { title: string; description: string }[];
  steps: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

const servicePages = [
  { href: '/term-paper-generator-online', label: 'Term paper generator' },
  { href: '/siwes-it-report-generator', label: 'SIWES / IT report generator' },
  { href: '/essay-generator-online', label: 'Essay generator' },
];

export function ServiceLandingPage({
  path,
  title,
  description,
  heading,
  introduction,
  benefitsHeading,
  benefits,
  steps,
  faqs,
}: ServiceLandingPageProps) {
  const pageUrl = `https://scholarverse.app${path}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { '@id': 'https://scholarverse.app/#website' },
        inLanguage: 'en-NG',
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-10 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>{heading}</span>
        </nav>

        <header className="mb-16 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
            Scholarverse academic writing tools
          </p>
          <h1 className="mb-6 text-4xl font-extrabold leading-tight font-headline sm:text-5xl">
            {heading}
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{introduction}</p>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start your document <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </header>

        <section aria-labelledby="benefits-heading" className="mb-16">
          <h2 id="benefits-heading" className="mb-4 text-2xl font-bold font-headline sm:text-3xl">
            {benefitsHeading}
          </h2>
          <p className="mb-8 max-w-3xl leading-relaxed text-muted-foreground">
            Scholarverse helps Nigerian tertiary students plan and prepare academic documents with an
            AI-assisted workflow. Add your own course, department, topic, and institution details, then
            review and edit the generated material before using it.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  {benefit.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="steps-heading" className="mb-16">
          <h2 id="steps-heading" className="mb-8 text-2xl font-bold font-headline sm:text-3xl">
            How to create your document
          </h2>
          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="mb-1 text-lg font-semibold">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="faq-heading" className="mb-16">
          <h2 id="faq-heading" className="mb-6 text-2xl font-bold font-headline sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <nav aria-label="Other document tools" className="mb-12">
          <h2 className="mb-4 text-xl font-bold font-headline">Explore other writing tools</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {servicePages.filter((page) => page.href !== path).map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="font-medium text-primary underline-offset-4 hover:underline">
                  {page.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/how-to-use" className="font-medium text-primary underline-offset-4 hover:underline">
                How Scholarverse works
              </Link>
            </li>
          </ul>
        </nav>

        <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            AI-generated content is a starting point, not a substitute for your own research. Check facts,
            references, and your institution&apos;s academic integrity rules before submission.
          </p>
        </footer>
      </div>
    </main>
  );
}
