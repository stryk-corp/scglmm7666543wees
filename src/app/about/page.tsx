'use client';

import Link from 'next/link';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {AnimatedBackground} from '@/components/ui/animated-background';
import {REPORT_EXPIRATION_DAYS} from '@/lib/config';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle,
  ChevronDown,
  Clock,
  Code2,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  Lock,
  Network,
  Pencil,
  Printer,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const tocItems = [
  {href: '#mission', label: 'Mission'},
  {href: '#problem', label: 'The Problem'},
  {href: '#how-it-works', label: 'How It Works'},
  {href: '#features', label: 'Features'},
  {href: '#modes', label: 'Report Modes'},
  {href: '#audience', label: 'Who It’s For'},
  {href: '#principles', label: 'Principles'},
  {href: '#security', label: 'Security'},
  {href: '#founders-heading', label: 'Founders'},
  {href: '#faq', label: 'FAQ'},
];

const painPoints = [
  'Margins, spacing and font rules that differ between departments and institutions.',
  'Roman numeral numbering for front matter and Arabic numbering for the body, switched at exactly the right page.',
  'Cover pages that must match a university’s expected layout.',
  'Writer’s block when summarising months of industrial attachment into clear technical chapters.',
  'Organograms and diagrams that take hours to draw and align manually.',
  'Last-minute panic before submission deadlines.',
];

const steps = [
  {
    title: 'Choose your report type',
    body: 'Start in SIWES mode for industrial training reports or Term Paper mode for coursework. Each mode loads the right sections and structure.',
  },
  {
    title: 'Enter your details',
    body: 'Add your personal information, institution, department, host company, skills learned and the work you carried out. These details drive everything the AI writes.',
  },
  {
    title: 'Generate and refine',
    body: 'The AI drafts sections such as the abstract, acknowledgement and technical chapters. Edit any text, regenerate a section, or rewrite it entirely until it reads like your own work.',
  },
  {
    title: 'Preview exactly what prints',
    body: `A real-time WYSIWYG print preview shows the finished document as it will appear on paper. When you are satisfied, pay securely and download your report. Downloads stay available for ${REPORT_EXPIRATION_DAYS} days.`,
  },
];

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Content Generation',
    body: 'Generates relevant, coherent drafts of the abstract, acknowledgement and technical chapters from the details you provide. Richer input produces richer output.',
  },
  {
    icon: GraduationCap,
    title: 'UNN & Nigerian University Cover Pages',
    body: 'Cover pages built for the University of Nigeria, Nsukka and other Nigerian universities, so your report starts with the right first impression.',
  },
  {
    icon: Network,
    title: 'Instant Organogram Diagrams',
    body: 'Describe your host organisation’s structure and get a clean organogram diagram without wrestling with drawing tools.',
  },
  {
    icon: Eye,
    title: 'Real-Time WYSIWYG Print Preview',
    body: 'See pagination, margins and layout update live as you edit, so there are no surprises when you print or export.',
  },
  {
    icon: FileText,
    title: 'Automatic Academic Formatting',
    body: 'Structural heavy-lifting such as margins, spacing and Roman numeral front-matter numbering is handled for you.',
  },
  {
    icon: Pencil,
    title: 'Full Editing Control',
    body: 'Every AI-generated section is editable. Regenerate, tweak or replace content freely before you commit to payment.',
  },
  {
    icon: BookOpen,
    title: 'Term Paper & SIWES Modes',
    body: 'One platform for both industrial training reports and general term papers, each with its own appropriate structure.',
  },
  {
    icon: Wallet,
    title: 'Secure Wallet & Payment Handling',
    body: 'Payments run through Paystack, a leading secure gateway in Africa. Card details are never stored on Scholarverse servers.',
  },
];

const modes = [
  {
    icon: Briefcase,
    title: 'SIWES Report Mode',
    description:
      'Built for the Students Industrial Work Experience Scheme. Turn your industrial attachment into a structured report covering your host organisation, the skills you gained, the tasks you performed and your conclusions.',
    bullets: [
      'Cover page and front matter',
      'Abstract and acknowledgement',
      'Company background and organogram',
      'Technical chapters on work experience',
      'Conclusion and recommendations',
    ],
  },
  {
    icon: BookOpen,
    title: 'Term Paper Mode',
    description:
      'For coursework and seminar-style papers. Organise your research into a clean, properly formatted document with the same print-accurate preview.',
    bullets: [
      'Institution-style title page',
      'Structured sections and headings',
      'Consistent spacing and pagination',
      'Editable AI drafting support',
      'Print-ready output',
    ],
  },
];

const audiences = [
  {
    title: 'SIWES students',
    body: 'Undergraduates and polytechnic students completing industrial training who need a professional report after their attachment.',
  },
  {
    title: 'Term paper writers',
    body: 'Students who want structure, formatting and drafting help for coursework without fighting layout settings.',
  },
  {
    title: 'Students on tight deadlines',
    body: 'Anyone who wants to move from blank page to print-ready document quickly, while still reviewing and owning the content.',
  },
  {
    title: 'Nigerian tertiary institutions’ students',
    body: 'Built specifically around Nigerian academic conventions, starting with University of Nigeria, Nsukka cover pages.',
  },
];

const principles = [
  {
    icon: Target,
    title: 'Practical first',
    body: 'Every feature exists to remove a real obstacle students face when preparing a report.',
  },
  {
    icon: Users,
    title: 'Built for Nigerian students',
    body: 'Designed around local academic conventions, institutions and payment methods.',
  },
  {
    icon: Pencil,
    title: 'You stay in control',
    body: 'AI drafts, you decide. Review and personalise everything so the report reflects your genuine experience.',
  },
  {
    icon: Lock,
    title: 'Safe by design',
    body: 'Secure cloud storage and a trusted payment gateway protect your data and your money.',
  },
];

const securityPoints = [
  'Personal and report data stored on robust, industry-standard cloud infrastructure.',
  'Payments processed by Paystack, a leading and highly secure payment gateway in Africa.',
  'Card details are never stored on Scholarverse servers.',
  `Purchased reports remain available for download for ${REPORT_EXPIRATION_DAYS} days.`,
  'Unlimited previews and edits before you pay.',
];

const faqs = [
  {
    question: 'What is Scholarverse?',
    answer:
      'Scholarverse (also known as SIWES AI Pro) is a web application that helps Nigerian tertiary students produce professionally formatted SIWES reports and term papers. It combines AI-assisted content generation, Nigerian university cover pages, organogram diagrams, and a real-time print preview.',
  },
  {
    question: 'Who built Scholarverse?',
    answer:
      'Scholarverse was jointly developed by founder Tobenna Ike, a software developer, web designer and author based in Abuja, Nigeria, and co-founder Uyanna Kingsley Chukwuebuka, a web developer and Mechanical Engineering student at the University of Nigeria, Nsukka.',
  },
  {
    question: 'How does the AI content generation work?',
    answer:
      'The AI uses the details you provide, such as your field of study, skills learned, and company information, to generate relevant, coherent content for sections like the abstract, acknowledgement and technical chapters. The more detail you provide, the better the output.',
  },
  {
    question: 'Which report types does Scholarverse support?',
    answer:
      'Scholarverse supports two modes: SIWES (Students Industrial Work Experience Scheme) reports and general term papers.',
  },
  {
    question: 'Does it support my university’s formatting?',
    answer:
      'Scholarverse includes cover pages for the University of Nigeria, Nsukka (UNN) and other Nigerian universities, and handles margins, Roman numeral front-matter numbering and structural layout automatically. Always confirm the final layout against your department’s guidelines.',
  },
  {
    question: 'Can I edit the AI-generated content?',
    answer:
      'Yes. Every section is editable directly in the form. You can regenerate sections, make manual tweaks and customise the report until you are satisfied, all before you pay for the final download.',
  },
  {
    question: 'Can Scholarverse generate an organogram?',
    answer:
      'Yes. Scholarverse can produce an organogram diagram of your host organisation instantly from the structure you describe, ready to place in your report.',
  },
  {
    question: 'Is my data and payment information secure?',
    answer:
      'Yes. Personal and report data is stored on industry-standard cloud infrastructure. Payments are processed through Paystack, a leading secure payment gateway in Africa. Scholarverse does not store your card details on its servers.',
  },
  {
    question: 'Why is there a fee to download the report?',
    answer:
      'The fee covers the cost of running the AI models that generate your report, server maintenance, and continuous improvement of the service. The goal is to stay affordable for students while keeping the tool reliable and high quality.',
  },
  {
    question: 'Can I get a refund?',
    answer: `Because of the nature of digital goods and the costs of AI generation, refunds are not offered once a report has been finalised and purchased. You can preview and edit your report as many times as you like before paying. After purchase, reports are available for download for ${REPORT_EXPIRATION_DAYS} days.`,
  },
  {
    question: 'Will the AI write my whole report for me?',
    answer:
      'Scholarverse is a collaborative tool. It drafts and formats, but your own experience and details drive the content, and you should review and personalise every section so the report truthfully reflects your work.',
  },
];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function SectionHeading({
  id,
  icon: Icon,
  eyebrow,
  title,
}: {
  id: string;
  icon: React.ComponentType<{size?: number}>;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-xs">
        <Icon size={24} />
      </div>
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        )}
        <h2 id={id} className="text-2xl sm:text-3xl font-headline font-semibold text-foreground scroll-mt-24">
          {title}
        </h2>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  return (
    <div className="min-h-screen text-foreground font-body bg-background relative">
      <AnimatedBackground />
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground font-medium">
              About
            </li>
          </ol>
        </nav>

        <main>
          {/* Hero */}
          <header>
            <Card className="mb-8 bg-card border-border shadow-md overflow-hidden">
              <div className="p-8 sm:p-12 text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <Image
                    src="/schverse-logo.png"
                    alt="Scholarverse logo"
                    width={56}
                    height={56}
                    priority
                    className="rounded-xl object-contain p-1 border border-border shadow-xs"
                  />
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                    Scholarverse · SIWES AI Pro
                  </p>
                </div>
                <h1 className="text-3xl sm:text-5xl font-headline font-bold text-foreground leading-tight">
                  About Scholarverse
                </h1>
                <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Empowering Nigerian tertiary students by simplifying academic and industrial report
                  writing, from AI-drafted content to print-perfect formatting.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/generate">
                    <Button size="lg">
                      Start your report
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <a href="#founders-heading">
                    <Button size="lg" variant="outline" className="border-border hover:bg-muted text-foreground">
                      Meet the founders
                    </Button>
                  </a>
                </div>
                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" /> SIWES & Term Paper modes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" /> Paystack-secured payments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" /> Unlimited free previews
                  </li>
                </ul>
              </div>
            </Card>
          </header>

          {/* Table of contents */}
          <nav
            aria-label="On this page"
            className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-xs"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              On this page
            </p>
            <ul className="flex flex-wrap gap-2">
              {tocItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-block rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Card className="bg-card border-border shadow-md">
            <CardContent className="p-6 md:p-10 space-y-16">
              {/* Mission */}
              <section aria-labelledby="mission" className="space-y-4">
                <SectionHeading id="mission" icon={Target} eyebrow="Why we exist" title="Our Mission" />
                <p className="text-foreground/90 leading-relaxed text-lg font-medium">
                  To eliminate the stress, panic, and complexity of academic report writing for university
                  students.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We believe your final submission should be a proud reflection of your knowledge and
                  practical experience, not an exhausting battle with margin sizes, Roman numeral page
                  numbering, and complex formatting guidelines. Scholarverse handles the structural
                  heavy-lifting so you can focus on mastering your discipline.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Scholarverse is a web application built specifically for Nigerian tertiary students. It
                  pairs AI-assisted drafting with accurate formatting, so a SIWES report or term paper can
                  go from blank page to print-ready document in a fraction of the usual time.
                </p>
              </section>

              {/* Problem */}
              <section aria-labelledby="problem" className="space-y-5">
                <SectionHeading
                  id="problem"
                  icon={HelpCircle}
                  eyebrow="The challenge"
                  title="The Problem We Set Out to Solve"
                />
                <p className="text-muted-foreground leading-relaxed">
                  Writing a SIWES report or term paper is rarely hard because students lack experience. It
                  is hard because the process around the writing is tedious and unforgiving. Students
                  commonly struggle with:
                </p>
                <ul className="grid gap-3 md:grid-cols-2">
                  {painPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4 text-sm text-muted-foreground leading-relaxed"
                    >
                      <CheckCircle size={16} className="mt-0.5 text-primary flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Scholarverse takes on those burdens so students can spend their energy on what the report
                  is actually about.
                </p>
              </section>

              {/* How it works */}
              <section aria-labelledby="how-it-works" className="space-y-6">
                <SectionHeading
                  id="how-it-works"
                  icon={Clock}
                  eyebrow="Four simple steps"
                  title="How Scholarverse Works"
                />
                <ol className="grid gap-4 md:grid-cols-2">
                  {steps.map((step, i) => (
                    <li key={step.title} className="relative rounded-2xl border border-border bg-background/50 p-6">
                      <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <h3 className="mb-2 mt-1 text-lg font-semibold font-headline text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Features */}
              <section aria-labelledby="features" className="space-y-6">
                <SectionHeading id="features" icon={Sparkles} eyebrow="What we offer" title="Features Built for Students" />
                <div className="grid gap-4 md:grid-cols-2">
                  {features.map(({icon: Icon, title, body}) => (
                    <article key={title} className="rounded-2xl border border-border bg-background/50 p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-lg font-semibold font-headline text-foreground">{title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                    </article>
                  ))}
                </div>
              </section>

              {/* Modes */}
              <section aria-labelledby="modes" className="space-y-6">
                <SectionHeading id="modes" icon={Printer} eyebrow="Two modes" title="SIWES Reports and Term Papers" />
                <div className="grid gap-6 md:grid-cols-2">
                  {modes.map(({icon: Icon, title, description, bullets}) => (
                    <article key={title} className="rounded-2xl border border-border bg-background/50 p-6">
                      <div className="mb-3 flex items-center gap-3 text-primary">
                        <Icon size={22} />
                        <h3 className="text-xl font-semibold font-headline text-foreground">{title}</h3>
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-primary flex-shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              {/* Audience */}
              <section aria-labelledby="audience" className="space-y-6">
                <SectionHeading id="audience" icon={Users} eyebrow="Our community" title="Who Scholarverse Is For" />
                <dl className="grid gap-4 md:grid-cols-2">
                  {audiences.map((a) => (
                    <div key={a.title} className="rounded-2xl border border-border bg-background/50 p-5">
                      <dt className="mb-1 font-semibold text-foreground font-headline">{a.title}</dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground">{a.body}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Principles */}
              <section aria-labelledby="principles" className="space-y-6">
                <SectionHeading id="principles" icon={Target} eyebrow="How we build" title="Our Principles" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {principles.map(({icon: Icon, title, body}) => (
                    <article key={title} className="rounded-2xl border border-border bg-background/50 p-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon size={20} />
                      </div>
                      <h3 className="mb-1 font-semibold font-headline text-foreground">{title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                    </article>
                  ))}
                </div>
              </section>

              {/* Security */}
              <section aria-labelledby="security" className="space-y-5">
                <SectionHeading id="security" icon={ShieldCheck} eyebrow="Your trust matters" title="Security, Payments & Privacy" />
                <p className="text-muted-foreground leading-relaxed">
                  We take security seriously. Here is how Scholarverse protects your work and your money:
                </p>
                <ul className="space-y-3">
                  {securityPoints.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground">
                      <CheckCircle size={18} className="mt-0.5 text-primary flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Founders */}
              <section aria-labelledby="founders-heading" className="space-y-6">
                <div className="space-y-3">
                  <SectionHeading
                    id="founders-heading"
                    icon={Code2}
                    eyebrow="The people behind it"
                    title="Meet the Founder and Co-Founder"
                  />
                  <p className="text-muted-foreground leading-relaxed">
                    Scholarverse was jointly developed by <strong className="text-foreground">Tobenna Ike</strong>{' '}
                    and <strong className="text-foreground">Uyanna Kingsley Chukwuebuka</strong>. Their shared
                    work brings together software development, web design, and frontend implementation to
                    build a practical academic writing platform for Nigerian students. Both studied or study
                    at the University of Nigeria, Nsukka, so they know first-hand the pressure of report
                    deadlines.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Founder */}
                  <article
                    itemScope
                    itemType="https://schema.org/Person"
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
                      <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-primary/10">
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary"
                        >
                          TI
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          itemProp="image"
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdEWCeO-gFWZzwtlWtgd8VnnOcdgLRpD19qAK5Mxe3dw&s=10"
                          alt="Portrait of Tobenna Ike, founder of Scholarverse"
                          width="128"
                          height="128"
                          loading="lazy"
                          className="relative h-32 w-32 rounded-2xl object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
                          <span itemProp="jobTitle">Founder</span>
                        </p>
                        <h3 itemProp="name" className="mb-3 text-xl font-bold font-headline text-foreground">
                          Tobenna Ike
                        </h3>
                        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                          <p itemProp="description">
                            Tobenna Ike is a software developer, web designer, and author based in Abuja,
                            Nigeria. He is the Chief Executive Officer of Stryk Corp and studied at the
                            University of Nigeria, Nsukka.
                          </p>
                          <p>
                            As a writer, Tobenna is the author of <em>The Mourning Mother&apos;s Curse</em>.
                            His experience building software and websites helped shape Scholarverse, a
                            platform designed to make academic report preparation more manageable for
                            students.
                          </p>
                        </div>
                        <dl className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold text-foreground">Based in</dt>
                            <dd>Abuja, Nigeria</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-foreground">Company</dt>
                            <dd>Stryk Corp (CEO)</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-foreground">University</dt>
                            <dd>University of Nigeria, Nsukka</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-foreground">Expertise</dt>
                            <dd>Software, web design, writing</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </article>

                  {/* Co-founder */}
                  <article
                    itemScope
                    itemType="https://schema.org/Person"
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
                      <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
                        <span aria-hidden="true">UC</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          itemProp="image"
                          src="https://i.ibb.co/yn1RDz0S/IMG-20261027-WA0010.jpg"
                          alt="Portrait of Uyanna Kingsley Chukwuebuka, co-founder of Scholarverse"
                          width="128"
                          height="128"
                          loading="lazy"
                          className="absolute inset-0 h-32 w-32 rounded-2xl object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
                          <span itemProp="jobTitle">Co-Founder</span>
                        </p>
                        <h3 itemProp="name" className="mb-3 text-xl font-bold font-headline text-foreground">
                          Uyanna Kingsley Chukwuebuka
                        </h3>
                        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                          <p itemProp="description">
                            Uyanna balances technology work with engineering studies at the University of
                            Nigeria, Nsukka, where he is pursuing a Bachelor of Engineering in Mechanical
                            Engineering, with the 2028 graduating class.
                          </p>
                          <p>
                            Alongside his studies, he works as a Web Developer at Creative Media Concept.
                            His frontend work includes website design, layout customization, coding, and
                            improving user-friendly digital experiences.
                          </p>
                          <p>
                            As co-founder and co-developer of Scholarverse, Uyanna contributed his frontend
                            and web development experience to the platform built for Nigerian tertiary
                            students.
                          </p>
                        </div>
                        <dl className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold text-foreground">Studying</dt>
                            <dd>B.Eng. Mechanical Engineering (Class of 2028)</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-foreground">Company</dt>
                            <dd>Creative Media Concept (Web Developer)</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-foreground">University</dt>
                            <dd>University of Nigeria, Nsukka</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-foreground">Expertise</dt>
                            <dd>Frontend, website design, layout</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </article>
                </div>
              </section>

              {/* FAQ (native details/summary keeps answers in the HTML for crawlers) */}
              <section aria-labelledby="faq" className="space-y-6">
                <SectionHeading id="faq" icon={HelpCircle} eyebrow="Answers" title="Frequently Asked Questions" />
                <div className="divide-y divide-border rounded-2xl border border-border bg-background/50">
                  {faqs.map((faq) => (
                    <details key={faq.question} className="group px-5 py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                        <h3 className="text-base font-semibold">{faq.question}</h3>
                        <ChevronDown
                          className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section
                aria-labelledby="cta-heading"
                className="rounded-2xl border border-border bg-primary/5 p-8 text-center space-y-4"
              >
                <h2 id="cta-heading" className="text-2xl font-headline font-semibold text-foreground">
                  Ready to write your report?
                </h2>
                <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Start your SIWES report or term paper now. Preview and edit as much as you like before you
                  pay.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/generate">
                    <Button size="lg">
                      Open the generator
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/generate">
                    <Button variant="outline" className="border-border hover:bg-muted text-foreground">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Generator
                    </Button>
                  </Link>
                </div>
              </section>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
