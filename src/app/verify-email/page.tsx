
'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { AlertCircle, ArrowLeft, Loader2, MailCheck } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get('email');
  const status = searchParams?.get('status');
  const referralStatus = searchParams?.get('referral');
  const auth = useAuth();
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) {
      setFeedback('Your sign-up session has expired. Please log in and request a new verification email.');
      return;
    }

    setResending(true);
    setFeedback(null);
    try {
      await sendEmailVerification(user);
      setFeedback('A new verification email has been sent. Check your inbox and spam folder.');
    } catch {
      setFeedback('We could not send the verification email. Please try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
            <MailCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            {status === 'email-error'
              ? 'Your account was created, but we could not send the verification email. Use the button below to try again.'
              : status === 'profile-error'
                ? 'Your account was created, but we could not finish setting up your profile.'
                : "We've sent a verification link to "}
            {status !== 'email-error' && status !== 'profile-error' && (
              <>
                <span className="font-semibold text-foreground">{email || 'your email address'}</span>.
                Please check your inbox and click the link to activate your account.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {status === 'setup-error'
              ? 'Your account exists and the verification email was sent, but we could not finish saving your profile. Do not sign up again; contact support if this message persists.'
              : status === 'profile-error'
                ? 'Please use the resend option if you have not received an activation email. Do not sign up again; contact support to complete your profile.'
                : "Once you've verified your email, you can log in to your account."}
          </p>
          {(status === 'email-error' || status === 'setup-error' || status === 'profile-error') && (
            <div role="alert" className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-left text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {status === 'email-error'
                  ? 'The account was created, but email activation is not complete yet.'
                  : status === 'profile-error'
                    ? 'The account was created, but the account profile could not be updated.'
                    : 'Your account was created, but profile setup was incomplete.'}
              </p>
            </div>
          )}
          {referralStatus && (
            <p role="status" className="mt-4 text-sm text-amber-700 dark:text-amber-400">
              {referralStatus === 'invalid'
                ? 'Your account was created, but the referral code was invalid or inactive and was not applied.'
                : 'Your account was created, but the referral code could not be applied. Please contact support.'}
            </p>
          )}
          {feedback && (
            <p role="status" className="mt-4 text-sm text-muted-foreground">
              {feedback}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="mt-5 w-full"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {resending ? 'Sending...' : 'Resend verification email'}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
