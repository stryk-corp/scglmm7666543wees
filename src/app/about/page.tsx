
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, HelpCircle, Users } from 'lucide-react';
import Image from 'next/image';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { REPORT_EXPIRATION_DAYS } from '@/lib/config';

const faqs = [
    {
        question: "What is SIWES AI Pro?",
        answer: "SIWES AI Pro is an innovative web application designed to help Nigerian students generate high-quality, professional Students Industrial Work Experience Scheme (SIWES) reports with ease. Using advanced AI, it automates the most tedious parts of report writing, from formatting to content generation."
    },
    {
        question: "How does the AI content generation work?",
        answer: "Our AI uses the information you provide—such as your field of study, skills learned, and company details—to generate relevant, coherent, and detailed content for sections like the abstract, acknowledgement, and technical chapters. The more detail you provide, the better the AI's output will be."
    },
    {
        question: "Is my data and payment information secure?",
        answer: "Yes. We take security very seriously. Your personal and report data is stored securely using robust, industry-standard cloud infrastructure. All payments are processed through Paystack, a leading and highly secure payment gateway in Africa. We do not store your card details on our servers."
    },
    {
        question: "What if I'm not satisfied with the generated report?",
        answer: "The application is designed to be a collaborative tool. You can edit any AI-generated content directly in the form. You can regenerate sections, make manual tweaks, and customize the report until you are satisfied before finalizing the payment."
    },
    {
        question: "Why is there a fee to download the report?",
        answer: "The fee covers the significant costs of running the powerful AI models required to generate your report, as well as server maintenance and continuous improvement of our service. We aim to keep the price affordable for students while ensuring a high-quality, reliable tool."
    },
    {
        question: "Can I get a refund?",
        answer: `Due to the nature of digital goods and the costs associated with AI generation, we do not offer refunds once a report has been finalized and purchased. You have unlimited ability to preview and edit your report before you commit to paying for the final download. Once purchased, reports are available for download for ${REPORT_EXPIRATION_DAYS} days.`
    }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen text-foreground font-body bg-background relative">
      <AnimatedBackground />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12">
        
        <Card className="mb-8 bg-card border-border shadow-md">
            <CardHeader className="text-center p-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <Image src="/schverse-logo.png" alt="Scholarverse Logo" width={48} height={48} className="rounded-xl object-contain p-1 border border-border shadow-xs"/>
                    <CardTitle className="text-3xl sm:text-4xl font-headline font-bold text-foreground">About Scholarverse</CardTitle>
                </div>
                <CardDescription className="text-base sm:text-lg text-muted-foreground font-normal">
                    Empowering Nigerian tertiary students by simplifying academic and industrial report writing.
                </CardDescription>
            </CardHeader>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6 md:p-10 space-y-12">
            
            {/* Our Mission Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-xs">
                        <Users size={24}/>
                    </div>
                    <h2 className="text-2xl font-headline font-semibold border-b-0 pb-0 text-foreground">Our Mission</h2>
                </div>
                <p className="text-foreground/90 leading-relaxed text-lg font-medium">
                    To eliminate the stress, panic, and complexity of academic report writing for university students.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    We believe that your final submission should be a proud reflection of your knowledge and practical experience, not an exhausting battle with margin sizes, Roman numeral page numbering, and complex formatting guidelines. Scholarverse handles the structural heavy-lifting so you can focus on mastering your discipline.
                </p>
            </div>

            {/* What We Offer Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-xs">
                        <CheckCircle size={24}/>
                    </div>
                    <h2 className="text-2xl font-headline font-semibold border-b-0 pb-0 text-foreground">What We Offer</h2>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-muted-foreground text-sm sm:text-base">
                    <li className="flex items-center gap-3"><CheckCircle size={16} className="text-primary flex-shrink-0" /> AI-Powered Content Generation</li>
                    <li className="flex items-center gap-3"><CheckCircle size={16} className="text-primary flex-shrink-0" /> UNN & Nigerian University Cover Pages</li>
                    <li className="flex items-center gap-3"><CheckCircle size={16} className="text-primary flex-shrink-0" /> Instant Organogram Diagrams</li>
                    <li className="flex items-center gap-3"><CheckCircle size={16} className="text-primary flex-shrink-0" /> Real-Time WYSIWYG Print Preview</li>
                    <li className="flex items-center gap-3"><CheckCircle size={16} className="text-primary flex-shrink-0" /> Term Paper & SIWES Modes</li>
                    <li className="flex items-center gap-3"><CheckCircle size={16} className="text-primary flex-shrink-0" /> Secure Wallet & Payment Handling</li>
                </ul>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-xs">
                        <HelpCircle size={24}/>
                    </div>
                    <h2 className="text-2xl font-headline font-semibold border-b-0 pb-0 text-foreground">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                         <AccordionItem key={index} value={`item-${index}`} className="border-border">
                            <AccordionTrigger className="text-left hover:no-underline text-base text-foreground font-semibold">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
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

    