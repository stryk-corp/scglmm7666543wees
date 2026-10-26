

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { useNotification } from '@/context/notification-context';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';
import { verifyAdminPassword } from '../actions';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const adminPath = (params?.adminPath as string) || '';

  const { showNotification } = useNotification();
  const auth = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      router.push(`/${adminPath}/dashboard`);
    }
  }, [isAdmin, adminLoading, router, adminPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      const result = await verifyAdminPassword(password, adminPath);

      if (result.success && result.token) {
        await signInWithCustomToken(auth, result.token);
        showNotification({ title: 'Admin Login Successful', message: "Welcome back!", type: 'success' });
        // The useEffect will handle redirecting to the dashboard
      } else {
        showNotification({
          title: 'Access Denied',
          message: result.error || 'Invalid password.',
          type: 'error'
        });
        setLoading(false);
      }
    } catch (error: any) {
        showNotification({
            title: 'Login Failed',
            message: 'An unexpected error occurred.',
            type: 'error'
        });
        setLoading(false);
    }
  };

  if (adminLoading || isAdmin || loading) {
    return (
      <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-semibold">Signing In...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter the administrator password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
