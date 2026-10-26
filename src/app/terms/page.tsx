
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';

const termsSections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using Scholarverse ("the Service"), you ("the User") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.',
  },
  {
    title: '2. Description of Service',
    content: 'The Service provides users with AI-powered tools to generate, format, and customize Students Industrial Work Experience Scheme (SIWES) reports. This includes, but is not limited to, content suggestions, diagram generation, and document styling based on user-provided information.',
  },
  {
    title: '3. User Accounts',
    content: 'To access the full features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
  },
  {
    title: '4. Payments, Fees, and Refunds',
    content: 'The Service requires a one-time payment to finalize and download a generated report. This fee is processed via our third-party payment processor, Paystack. Due to the digital nature of the product and the significant costs associated with AI generation, all sales are final and non-refundable.',
  },
  {
    title: '5. Intellectual Property and Use of Content',
    content: 'You retain ownership of the factual information you provide. The final generated report is licensed to you for personal and academic use only. You may not resell or redistribute the Service or its output. The Service itself, including its branding and design, is the exclusive property of Scholarverse.',
  },
  {
    title: '6. User Conduct and Responsibilities',
    content: 'You agree not to use the Service for any illegal or fraudulent purpose. You are solely responsible for the academic integrity of your final report and must review it for accuracy and originality.',
  },
  {
    title: '7. Disclaimer of Warranties',
    content: 'The Service is provided "as is". We do not guarantee that the generated content will be error-free or meet specific academic requirements. It is your responsibility to review and edit the final report to ensure it meets your institution\'s standards.',
  },
  {
    title: '8. Limitation of Liability',
    content: 'In no event shall Scholarverse be liable for any indirect, incidental, or consequential damages, including academic penalties, arising from your use of the Service. Our total liability will not exceed the amount you paid for the Service.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen text-foreground font-body bg-background relative">
      <AnimatedBackground />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12">
        
        <Card className="mb-8 bg-card border-border shadow-md">
            <CardHeader className="text-center p-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-xs">
                        <FileText size={24}/>
                    </div>
                    <CardTitle className="text-3xl sm:text-4xl font-headline font-bold text-foreground">Terms of Service</CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground font-normal">
                    Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
            </CardHeader>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6 md:p-10 space-y-8">
            {termsSections.map((section, index) => (
              <div key={index} className="text-left">
                <h2 className="text-lg font-headline font-semibold text-foreground mb-2">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{section.content}</p>
              </div>
            ))}
            
            <div className="text-center pt-8">
                <Link href="/" passHref>
                    <Button variant="outline" className="border-border hover:bg-muted text-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
