
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
            <div className="mx-auto bg-destructive/10 text-destructive p-3 rounded-full w-fit mb-4">
                <AlertTriangle className="h-8 w-8" />
            </div>
            <CardTitle className="text-4xl font-bold">404</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
                Oops! The page you're looking for doesn't exist.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            It seems you've followed a broken link or entered a URL that doesn't exist on this site.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" passHref>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
