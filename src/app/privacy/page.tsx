
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/animated-background';

const privacySections = [
    {
        title: "1. Introduction",
        content: "Welcome to Scholarverse. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service."
    },
    {
        title: "2. Information We Collect",
        content: "We collect Personal Data (name, email), User-Provided Data (report details for AI generation), and Payment Data (transaction confirmations, not card details). We also collect anonymous Usage Data to improve our service."
    },
    {
        title: "3. How We Use Your Information",
        content: "Your information is used to create your account, generate your report (by sending data to our AI provider), process payments, and improve our application. We do not sell your data."
    },
    {
        title: "4. Data Storage and Security",
        content: "Your data is stored on secure cloud servers. Report drafts are saved to your account. Purchased reports are stored for a limited time (7 days) for download access, after which they are deleted."
    },
    {
        title: "5. Data Sharing",
        content: "We share report-related data with our AI provider solely for content generation. We do not sell or rent your personal information. Anonymized, aggregated data may be used for analytics."
    },
    {
        title: "6. Your Rights",
        content: "You have the right to access and update your profile information at any time. You may also request the deletion of your account by contacting support, subject to legal and transactional data retention policies."
    },
    {
        title: "7. Changes to This Policy",
        content: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and through in-app notifications."
    }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-slate-200 font-body">
      <AnimatedBackground />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12">
        
        <Card className="mb-8 bg-black/30 border-slate-800 shadow-2xl backdrop-blur-lg">
            <CardHeader className="text-center p-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Shield size={24}/>
                    </div>
                    <CardTitle className="text-4xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Privacy Policy</CardTitle>
                </div>
                <CardDescription className="text-lg text-slate-400 font-light">
                    Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
            </CardHeader>
        </Card>

        <Card className="bg-black/20 border-slate-800 shadow-lg backdrop-blur-md">
          <CardContent className="p-6 md:p-10 space-y-8">
            {privacySections.map((section, index) => (
              <div key={index} className="text-center">
                <h2 className="text-xl font-headline font-semibold text-slate-100 mb-2">{section.title}</h2>
                <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">{section.content}</p>
              </div>
            ))}
            
            <div className="text-center pt-8">
                <Link href="/home" passHref>
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800 hover:text-slate-100">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home Page
                    </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
