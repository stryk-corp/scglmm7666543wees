'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import Link from 'next/link';
import { KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import { useNotification } from '@/context/notification-context';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showNotification } = useNotification();
  const auth = useAuth();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || emailSent) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showNotification({
        title: 'Password Reset Email Sent',
        message: `A reset link has been sent to ${email}. Please check your inbox.`,
        type: 'success'
      });
      setEmailSent(true);
    } catch (error: any) {
      showNotification({
        title: 'Error Sending Reset Email',
        message: error.message || 'An unknown error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
              <KeyRound className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Your Password?</CardTitle>
          <CardDescription>
            {emailSent
              ? `A password reset link has been sent to ${email}. Please check your inbox.`
              : "No problem. Enter your email address below and we'll send you a link to reset it."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || emailSent}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || emailSent}>
              {loading ? <Loader2 className="animate-spin" /> : (emailSent ? 'Reset Link Sent' : 'Send Password Reset Link')}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center text-sm">
          <Link href="/login" passHref>
             <Button variant="link" className="text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
