
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import Link from 'next/link';
import { useNotification } from '@/context/notification-context';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

function getLoginErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : undefined;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Unable to connect. Check your internet connection and try again.';
    default:
      return 'We could not sign you in. Please check your details and try again.';
  }
}

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams?.get('status');
    if (status === 'reset_success') {
      setStatusMessage('Your password has been changed successfully. Please log in with your new password.');
    }
  }, [searchParams]);

  useEffect(() => {
    // If done loading and user is logged in, redirect to the main app page.
    if (!userLoading && user) {
      router.push('/generate');
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      showNotification({
        title: 'Login Unavailable',
        message: 'Authentication is not ready. Please refresh the page and try again.',
        type: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await auth.signOut();
        showNotification({
          title: 'Email Not Verified',
          message: 'Please verify your email address before logging in. Check your inbox for a verification link.',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      showNotification({ title: 'Login Successful', message: "You're now logged in.", type: 'success' });
      // The useEffect will handle the redirect.
    } catch (error: unknown) {
      showNotification({
        title: 'Login Failed',
        message: getLoginErrorMessage(error),
        type: 'error'
      });
      setLoading(false);
    }
  };
  
  if (userLoading || user) {
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
                  Loading Scholarverse...
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
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {statusMessage && (
            <Alert variant="default" className="bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4 !text-green-500" />
              <AlertTitle className="font-bold">Success</AlertTitle>
              <AlertDescription>
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="grid gap-4">
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
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
            Don&apos;t have an account? <Link href="/signup" className="ml-1 underline">Sign up</Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}
