'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookCheck, Bot, BarChart3, Sparkles, GraduationCap, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import Image from 'next/image';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { TestimonialsCarousel } from '@/components/testimonials-carousel';
import { UniversityLeaderboard } from '@/components/university-leaderboard';

const FeatureCard = ({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
}) => {
  const Icon = icon;
  return (
    <div className="bg-card rounded-2xl p-7 sm:p-8 border border-border shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col text-left">
      <div className="flex items-center justify-between mb-5">
        <div className="bg-primary/10 text-primary p-3 rounded-xl w-fit shadow-xs">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        {badge && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-primary/20">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold font-headline text-foreground mb-2.5">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen text-foreground font-body bg-background selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Main Header */}
        <header className="sticky top-4 z-40 bg-card/85 backdrop-blur-md border border-border rounded-2xl px-4 sm:px-6 py-3 shadow-xs mb-16 md:mb-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border/80 shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-1">
              <Image
                src="/schverse-logo.png"
                alt="Scholarverse Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-sans">
                Scholarverse
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-primary/10 text-primary border border-primary/20 hidden sm:inline">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#leaderboard" className="hover:text-foreground transition-colors">
              Universities
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" passHref>
              <Button variant="ghost" className="text-foreground hover:bg-muted font-medium text-sm">
                Login
              </Button>
            </Link>
            <Link href="/signup" passHref>
              <Button className="font-semibold text-sm shadow-sm hover:shadow-md">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-28 md:mb-36 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs sm:text-sm font-medium mb-8 animate-fade-in shadow-xs">
            <Sparkles className="h-4 w-4" />
            <span>The #1 AI Academic &amp; SIWES Generator for Nigerian Students</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.12] tracking-tight font-headline text-foreground max-w-4xl mx-auto">
            Generate Defense-Ready{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-primary to-teal-600">
              Reports &amp; Term Papers
            </span>{' '}
            in Minutes
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Say goodbye to formatting headaches and writing fatigue. Scholarverse crafts authentic,
            university-standard SIWES reports, academic term papers, and essays tailored to your department,
            complete with UNN cover page formatting and APA references.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-6">
            <Link href="/signup" passHref className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base font-semibold px-8 py-6 shadow-md hover:shadow-lg transition-all">
                Start Generating Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-to-use" passHref className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-medium px-8 py-6 bg-card border-border hover:bg-muted/60 text-foreground">
                How It Works
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground pt-3">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Term Papers &amp; SIWES
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              UNN &amp; NUC Standards
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              No Credit Card Needed
            </span>
          </div>
        </section>

        {/* Supported Document Types Highlight */}
        <section className="mb-28 md:mb-36">
          <div className="bg-gradient-to-b from-primary/5 via-card to-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3 font-headline">
                Tailored for Nigerian University Requirements
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Whether you are submitting an industrial attachment report or a semester term paper,
                Scholarverse formats each page to academic specifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Term Papers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Structured with Academic Level, Lecturer Name, Faculty, Department, Course Code, and APA Reference styling.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <BookCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">SIWES / IT Reports</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete with Place of Attachment, Industry Supervisors, Company Profiles, Organograms, and Weekly Skill logs.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Essays &amp; Seminar Papers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rigorous background analysis, clear thesis development, and balanced academic conclusions without plagiarism.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mb-28 md:mb-36 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline text-foreground mb-3">
              Why Students Trust Scholarverse
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Built from the ground up for African academic institutions, combining AI intelligence with strict formatting rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={Bot}
              badge="Course Tailored"
              title="AI-Powered Technical Content"
              description="Our specialized models draft in-depth technical chapters, abstracts, acknowledgements, and methodology suited directly to your field of study."
            />
            <FeatureCard
              icon={BookCheck}
              badge="UNN & NUC Standard"
              title="Academic Standard Formatting"
              description="Every export is pre-configured with exact margins, formal roman and arabic page numbering, university cover headers, and clean typography."
            />
            <FeatureCard
              icon={BarChart3}
              badge="Zero Design Skills"
              title="Instant Organogram Diagrams"
              description="Generate crisp corporate hierarchy and organizational charts just by entering company roles. No design tools or manual graphics required."
            />
          </div>
        </section>

        {/* University Leaderboard Section */}
        <section id="leaderboard" className="mb-28 md:mb-36">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline text-foreground mb-3">
              Top Active Universities
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              See which tertiary institutions are generating the most defense-ready reports on Scholarverse.
            </p>
          </div>
          <UniversityLeaderboard />
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="mb-28 md:mb-36">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline text-foreground mb-3">
              What Students Say
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Real feedback from undergraduates across federal, state, and private universities.
            </p>
          </div>
          <TestimonialsCarousel />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mb-28 md:mb-36">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline text-foreground mb-3">
              A Simple Path to a High-Scoring Report
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Go from a blank page to a print-ready document in three guided steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-card rounded-2xl p-8 border border-border shadow-xs flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-xl font-bold font-mono text-primary mb-5 shadow-xs">
                1
              </div>
              <h3 className="text-xl font-bold font-headline text-foreground mb-2.5">
                Enter Simple Details
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Provide your school, department, matric number, and document topic in our intuitive 7-step guided wizard.
              </p>
            </div>

            <div className="text-center bg-card rounded-2xl p-8 border border-border shadow-xs flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-xl font-bold font-mono text-primary mb-5 shadow-xs">
                2
              </div>
              <h3 className="text-xl font-bold font-headline text-foreground mb-2.5">
                Generate with AI
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Click generate to let our academic models compose detailed content, abstracts, tools used, and organograms.
              </p>
            </div>

            <div className="text-center bg-card rounded-2xl p-8 border border-border shadow-xs flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-xl font-bold font-mono text-primary mb-5 shadow-xs">
                3
              </div>
              <h3 className="text-xl font-bold font-headline text-foreground mb-2.5">
                Preview &amp; Download
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Live preview your exact cover page and report layout, make adjustments if desired, and export your print-ready document.
              </p>
            </div>
          </div>
        </section>

        {/* Document-specific resources */}
        <section aria-labelledby="document-tools-heading" className="mb-28 md:mb-36">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 id="document-tools-heading" className="text-3xl sm:text-4xl font-extrabold font-headline text-foreground mb-3">
              Choose the Right Academic Writing Tool
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Explore an online workflow for your term paper, SIWES or IT report, or academic essay.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/term-paper-generator-online" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <h3 className="mb-2 text-lg font-bold font-headline">Generate a Term Paper Online</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Start an editable academic term paper draft with your topic, course, and assignment details.
              </p>
            </Link>
            <Link href="/siwes-it-report-generator" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <h3 className="mb-2 text-lg font-bold font-headline">Generate a SIWES / IT Report</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Organize your real industrial training activities and skills into a structured report draft.
              </p>
            </Link>
            <Link href="/essay-generator-online" className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <h3 className="mb-2 text-lg font-bold font-headline">Generate an Academic Essay</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Develop an essay prompt into a structured draft you can research, revise, and make your own.
              </p>
            </Link>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mb-20">
          <div className="rounded-3xl bg-gradient-to-r from-primary/15 via-emerald-500/10 to-teal-500/10 border border-primary/25 p-8 sm:p-14 text-center shadow-md relative overflow-hidden">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4 font-headline">
              Ready to Finish Your Report Today?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Join thousands of Nigerian undergraduates who saved weeks of stress. Get started with Scholarverse now.
            </p>
            <Link href="/signup" passHref>
              <Button size="lg" className="font-semibold text-base px-8 py-6 shadow-md hover:shadow-lg">
                Create My Report Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-12 pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <Image
                src="/schverse-logo.png"
                alt="Scholarverse Logo"
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
              <span className="text-lg font-black text-foreground font-sans">Scholarverse</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
              <Link href="/how-to-use" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Scholarverse. All rights reserved. Built for Nigerian Tertiary Education.
          </div>
        </footer>
      </div>
    </div>
  );
}
