
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, collection, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import Link from 'next/link';
import { useNotification } from '@/context/notification-context';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { applySignupReferral } from '@/app/actions/apply-signup-referral';

function getSignupErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : undefined;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a stronger password and try again.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-up is not enabled for this Firebase project.';
    case 'auth/network-request-failed':
      return 'Unable to connect. Check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Your account could not be saved to the database. Please contact support before trying to sign up again.';
    default:
      return 'We could not complete sign-up. Please try again.';
  }
}

function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    const refCode = searchParams?.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      showNotification({
        title: 'Sign-up Unavailable',
        message: 'Authentication is not ready. Please refresh the page and try again.',
        type: 'error'
      });
      return;
    }
    setLoading(true);
    let createdUser: Awaited<ReturnType<typeof createUserWithEmailAndPassword>>['user'] | null = null;
    let profileUpdated = false;
    let verificationEmailSent = false;
    let referralStatus: 'invalid' | 'error' | null = null;

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      createdUser = user;

      await updateProfile(user, { displayName: fullName });
      profileUpdated = true;
      await sendEmailVerification(user);
      verificationEmailSent = true;

      const batch = writeBatch(firestore);
      const userDocRef = doc(firestore, 'users', user.uid);
      const newUserDocData: Record<string, string | number | boolean | null> = {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        balance: 0,
        isReferralActive: false,
        referredBy: null,
        referralCount: 0,
        referralBalance: 0,
      };

      const utmSource = searchParams?.get('utm_source');
      const utmMedium = searchParams?.get('utm_medium');
      const utmCampaign = searchParams?.get('utm_campaign');

      if (utmSource) newUserDocData.utm_source = utmSource;
      if (utmMedium) newUserDocData.utm_medium = utmMedium;
      if (utmCampaign) newUserDocData.utm_campaign = utmCampaign;

      batch.set(userDocRef, newUserDocData);

      const notificationsRef = collection(userDocRef, 'notifications');
      const welcomeNotificationRef = doc(notificationsRef, 'welcome');
      batch.set(welcomeNotificationRef, {
        title: 'Welcome to Scholarverse!',
        body: `We're thrilled to have you! Generate essays for ₦500, term papers for ₦1,500, and SIWES/IT reports for ₦6,000. Let's create your academic document!`,
        icon: 'Wand2',
        type: 'info',
        createdAt: serverTimestamp(),
        isRead: false,
      });

      await batch.commit();

      if (referralCode.trim()) {
        try {
          const referralResult = await applySignupReferral(
            await user.getIdToken(),
            referralCode.trim()
          );
          if (referralResult === 'invalid') referralStatus = 'invalid';
        } catch (error) {
          console.error('Could not apply signup referral:', error);
          referralStatus = 'error';
        }
      }

      showNotification({
        title: 'Signup Successful',
        message: 'Your account was created. Check your email to activate it.',
        type: 'success'
      });
      const params = new URLSearchParams({
        email: user.email || email,
        status: 'sent'
      });
      if (referralStatus) params.set('referral', referralStatus);
      router.replace(`/verify-email?${params.toString()}`);
    } catch (error: unknown) {
      showNotification({
        title: createdUser ? 'Account Created' : 'Signup Failed',
        message: getSignupErrorMessage(error),
        type: 'error'
      });

      if (createdUser) {
        const params = new URLSearchParams({
          email: createdUser.email || email,
          status: !profileUpdated
            ? 'profile-error'
            : !verificationEmailSent
              ? 'email-error'
              : 'setup-error'
        });
        router.replace(`/verify-email?${params.toString()}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <Image
                    src="/schverse-loader.gif"
                    alt="Scholarverse Loading"
                    width={112}
                    height={112}
                    className="object-contain drop-shadow-sm"
                    unoptimized
                    priority
                  />
                </div>
                <p className="text-sm font-semibold tracking-wide text-foreground/80 animate-pulse">
                  Creating your Scholarverse account...
                </p>
                <p className="text-xs text-muted-foreground">Please wait a moment</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
      <Link href="/" className="flex items-center gap-2.5 mb-6 group">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-card border border-border shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-1">
          <Image
            src="/schverse-logo.png"
            alt="Scholarverse Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <span className="text-2xl font-black tracking-tight text-foreground font-sans">Scholarverse</span>
      </Link>
      <Card className="w-full max-w-sm shadow-md border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
            Already have an account? <Link href="/login" className="ml-1 underline">Log in</Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
