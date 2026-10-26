
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Wand2, Sparkles, Printer, GraduationCap, FileSignature, Settings, Download } from 'lucide-react';
import Image from 'next/image';
import { AnimatedBackground } from '@/components/ui/animated-background';

const StepCard = ({ icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => {
    const Icon = icon;
    return (
        <div className="flex gap-6">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-xs">
                    <Icon size={24} />
                </div>
                <div className="w-px flex-grow bg-border my-2"></div>
            </div>
            <div className="pb-6">
                <h3 className="text-xl font-headline font-semibold mb-2 text-foreground">{title}</h3>
                <div className="text-muted-foreground leading-relaxed space-y-2 text-sm sm:text-base">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function HowToUsePage() {
  return (
    <div className="min-h-screen text-foreground font-body bg-background relative">
      <AnimatedBackground />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12">
        
        <Card className="mb-8 bg-card border-border shadow-md">
            <CardHeader className="text-center p-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <Image src="/schverse-logo.png" alt="Scholarverse Logo" width={48} height={48} className="rounded-xl object-contain p-1 border border-border shadow-xs"/>
                    <CardTitle className="text-3xl sm:text-4xl font-headline font-bold text-foreground">How Scholarverse Works</CardTitle>
                </div>
                <CardDescription className="text-base sm:text-lg text-muted-foreground font-normal">
                    Your step-by-step guide to generating a defense-ready report or term paper in minutes.
                </CardDescription>
            </CardHeader>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6 md:p-10 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-xs">
                    <GraduationCap size={24}/>
                </div>
                <h2 className="text-2xl font-headline font-semibold border-b-0 pb-0 text-foreground">A Simple Path to a High-Scoring Document</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Scholarverse is engineered to make academic and industrial report writing straightforward and fast. By collecting key information through a guided multi-step wizard, our models write rigorous chapters with proper cover page layout and reference styles.
              </p>
            </div>

            <div className="space-y-2">
                <StepCard icon={FileSignature} title="Step 1: Choose Your Document & Enter Details">
                    <p>
                        Select your document type (Academic Term Paper, SIWES / IT Report, or Essay). Enter your topic, school, department, and course code in our intuitive form with zero confusing jargon.
                    </p>
                </StepCard>

                <StepCard icon={Wand2} title="Step 2: AI-Powered Chapter Composition">
                    <p>
                        Use the built-in AI generators to draft in-depth technical chapters, abstracts, methodology, and organograms tailored to your university curriculum.
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-2 text-muted-foreground text-sm">
                        <li><strong>AI Suggestion Buttons <Sparkles className="inline h-4 w-4 text-primary" />:</strong> Click anytime you need creative suggestions for thesis statements or technical summaries.</li>
                        <li><strong>Automatic Organograms:</strong> Enter company roles to generate an instant organizational hierarchy chart.</li>
                    </ul>
                </StepCard>

                <StepCard icon={Settings} title="Step 3: Live Preview & Document Formatting">
                    <p>
                        Preview your document in real-time as you write. Inspect cover page alignments, Roman/Arabic page numbers, font sizing, and margins matching university requirements.
                    </p>
                </StepCard>

                 <StepCard icon={Download} title="Step 4: Finalize & Print-Ready Export">
                     <p>
                        Once your details are complete, finalize and save the report to your profile. You can print or download anytime directly from your dashboard.
                    </p>
                </StepCard>
            </div>

            <div className="text-center pt-8">
                <Link href="/generate" passHref>
                    <Button variant="outline" className="border-border hover:bg-muted text-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Generator
                    </Button>
                </Link>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    