
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, applyActionCode, verifyPasswordResetCode, confirmPasswordReset, Auth } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useNotification } from '@/context/notification-context';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound, MailCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm({ auth, actionCode }: { auth: Auth, actionCode: string }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const router = useRouter();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification({ title: 'Error', message: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      showNotification({ title: 'Error', message: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      // Redirect to login page with a success status
      router.push('/login?status=reset_success');
    } catch (error: any) {
      showNotification({ title: 'Error', message: error.message || 'Failed to reset password.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
        <CardHeader>
             <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                <KeyRound className="h-8 w-8" />
            </div>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>Enter a new password for your account below.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordReset}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
                </div>
            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Change Password'}
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}

function ActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const { showNotification } = useNotification();

  const [mode, setMode] = useState<string | null>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'form'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const modeParam = searchParams?.get('mode');
    const codeParam = searchParams?.get('oobCode');

    if (!modeParam || !codeParam || !auth) {
        setMessage('Invalid action link. Please try again.');
        setStatus('error');
        return;
    }

    setMode(modeParam);
    setActionCode(codeParam);

    switch (modeParam) {
      case 'resetPassword':
        verifyPasswordResetCode(auth, codeParam)
          .then(() => {
            setStatus('form');
          })
          .catch((error) => {
            setMessage('This password reset link is invalid or has expired. Please request a new one.');
            setStatus('error');
          });
        break;
        
      case 'verifyEmail':
        applyActionCode(auth, codeParam)
          .then(() => {
            setMessage('Your email has been verified successfully! You can now log in.');
            setStatus('success');
            showNotification({title: 'Email Verified', message: 'You can now log in to your account.', type: 'success'});
          })
          .catch((error) => {
            setMessage('Failed to verify email. The link may be expired or invalid.');
            setStatus('error');
          });
        break;
        
      default:
        setMessage('Unknown action. Please check the link and try again.');
        setStatus('error');
    }
  }, [searchParams, auth, showNotification]);

  if (status === 'loading') {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Verifying action...</p>
        </div>
    );
  }

  if (status === 'error') {
     return (
         <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-destructive/10 text-destructive p-3 rounded-full w-fit mb-4">
                    <AlertCircle className="h-8 w-8" />
                </div>
                <CardTitle>Action Failed</CardTitle>
                <CardDescription>{message}</CardDescription>
            </CardHeader>
             <CardFooter>
                <Button onClick={() => router.push('/login')} className="w-full">Back to Login</Button>
            </CardFooter>
        </Card>
     );
  }
  
  if (status === 'success') {
      return (
         <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                 <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                    <MailCheck className="h-8 w-8" />
                </div>
                <CardTitle>Success!</CardTitle>
                <CardDescription>{message}</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button onClick={() => router.push('/login')} className="w-full">Proceed to Login</Button>
            </CardFooter>
        </Card>
      );
  }
  
  if (status === 'form' && mode === 'resetPassword' && actionCode && auth) {
    return <ResetPasswordForm auth={auth} actionCode={actionCode} />;
  }

  return null;
}

export default function AuthActionPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }>
                <ActionHandler />
            </Suspense>
        </div>
    );
}
