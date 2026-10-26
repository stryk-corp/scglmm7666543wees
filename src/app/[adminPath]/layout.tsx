
'use client';

import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { Users, FileText, BarChart, Bell, LogOut, Loader2, Menu, Package, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/firebase';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardTitle } from '@/components/ui/card';
import { LoadingLink } from '@/components/ui/loading-link';
import { getAdminPath } from './actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const adminPath = (params?.adminPath as string) || '';
  const { user, isAdmin, loading } = useAdmin();
  const auth = useAuth();
  const [isValidPath, setIsValidPath] = useState<boolean | null>(null);

  const navItems = [
    { href: `/${adminPath}/dashboard`, icon: Users, label: 'Users' },
    { href: `/${adminPath}/reports`, icon: FileText, label: 'Reports' },
    { href: `/${adminPath}/earnings`, icon: BarChart, label: 'Earnings' },
    { href: `/${adminPath}/notifications`, icon: Bell, label: 'Notifications' },
    { href: `/${adminPath}/withdrawals`, icon: Landmark, label: 'Withdrawals' },
  ];

  useEffect(() => {
    async function verifyPath() {
        if (!adminPath) {
            setIsValidPath(false);
            return;
        }
        const serverPath = await getAdminPath();
        if (serverPath && serverPath === adminPath) {
            setIsValidPath(true);
        } else {
            setIsValidPath(false);
        }
    }
    verifyPath();
  }, [adminPath]);
  
  useEffect(() => {
    if (isValidPath === false) {
      router.push('/not-found');
    }
  }, [isValidPath, router]);


  useEffect(() => {
    if (!loading && isValidPath && pathname && !pathname.endsWith('/login') && (!user || !isAdmin)) {
      router.push(`/${adminPath}/login`);
    }
  }, [user, isAdmin, loading, router, pathname, adminPath, isValidPath]);


  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      router.push(`/${adminPath}/login`);
    } catch (error) {
      console.error('Sign Out Failed', error);
    }
  };
  
  // Render nothing until path validity is determined.
  if (isValidPath === null) {
     return null;
  }

  // If path is invalid, render nothing and let the useEffect redirect.
  if (isValidPath === false) {
    return null;
  }

  if (pathname?.endsWith('/login')) {
    return <>{children}</>;
  }

  // If path is valid but user is not an authenticated admin, show a loader.
  if (loading || !isAdmin || !user) {
    return (
      <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-semibold">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }
  
  // Only render the layout if the path is valid and the user is an admin.
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <LoadingLink href="/" className="flex items-center gap-2 font-semibold">
              <Package className="h-6 w-6" />
              <span className="">Admin Panel</span>
            </LoadingLink>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <LoadingLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname === item.href && 'bg-muted text-primary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </LoadingLink>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
             <Button size="sm" className="w-full" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <LoadingLink
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Package className="h-6 w-6" />
                  <span className="">Admin Panel</span>
                </LoadingLink>
                {navItems.map((item) => (
                    <LoadingLink
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        pathname === item.href && 'bg-muted text-primary'
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                    </LoadingLink>
                ))}
              </nav>
              <div className="mt-auto">
                <Button size="sm" className="w-full" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
           <div className="w-full flex-1">
             <CardTitle>Admin</CardTitle>
           </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
