
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Gift, Copy, Landmark, Loader2, Users, Wallet } from 'lucide-react';
import { useNotification } from '@/context/notification-context';
import type { UserProfileData } from '@/lib/types';
import { useUser } from '@/firebase';
import { Label } from './ui/label';

const WITHDRAWAL_THRESHOLD = 20000;

interface ReferralProgramCardProps {
  profileData: UserProfileData;
  userId: string;
}

export function ReferralProgramCard({ profileData, userId }: ReferralProgramCardProps) {
  const { showNotification } = useNotification();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isWithdrawalWindowOpen, setIsWithdrawalWindowOpen] = useState(false);
  const { user } = useUser();
  
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    setIsWithdrawalWindowOpen(dayOfMonth >= 16 && dayOfMonth <= 20);
  }, []);
  
  useEffect(() => {
    const baseUrl = `${window.location.origin}/signup?ref=${userId}`;
    const params = new URLSearchParams();
    if (source) params.append('utm_source', source);
    if (medium) params.append('utm_medium', medium);
    if (campaign) params.append('utm_campaign', campaign);
    
    const queryString = params.toString();
    setGeneratedUrl(queryString ? `${baseUrl}&${queryString}` : baseUrl);
  }, [userId, source, medium, campaign]);


  const handleCopyReferral = async () => {
    try {
        await navigator.clipboard.writeText(generatedUrl);
        showNotification({ title: "Copied!", message: "Your referral link has been copied to the clipboard.", type: "success" });
    } catch (err) {
        showNotification({ title: "Copy Failed", message: "Could not copy the link. Please copy it manually.", type: 'warning' });
        console.error('Failed to copy text: ', err);
    }
  };
  
  const handleWithdraw = async () => {
    if (!user) return;
    setIsWithdrawing(true);

    try {
        const token = await user.getIdToken();
        const response = await fetch('/api/initiateWithdrawal', {
             method: 'POST',
             headers: {
                'Authorization': `Bearer ${token}`
             }
        });
        
        const result = await response.json();

        if (result.success) {
            showNotification({ title: "Withdrawal Successful", message: "Your withdrawal has been processed and is on its way to your bank account.", type: 'success' });
        } else {
            showNotification({ title: "Withdrawal Failed", message: result.error || "An error occurred while processing your withdrawal.", type: 'error' });
        }
    } catch (error: any) {
        showNotification({ title: "Withdrawal Failed", message: error.message || "An error occurred while processing your withdrawal.", type: 'error' });
    } finally {
        setIsWithdrawing(false);
    }
  };

  const canWithdraw = (profileData.referralBalance || 0) >= WITHDRAWAL_THRESHOLD && !!profileData.bankName && !!profileData.accountNumber && !!profileData.accountName && isWithdrawalWindowOpen;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> Referral Program</CardTitle>
        <CardDescription>Share your link to earn rewards. Use the builder for precise tracking.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-lg border bg-background p-4">
            <h4 className="font-medium">Campaign URL Builder</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label htmlFor="utm_source" className="text-xs">Source</Label>
                    <Input id="utm_source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g., facebook" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="utm_medium" className="text-xs">Medium</Label>
                    <Input id="utm_medium" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="e.g., social" />
                </div>
             </div>
             <div className="space-y-1">
                <Label htmlFor="utm_campaign" className="text-xs">Campaign</Label>
                <Input id="utm_campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="e.g., summer_promo" />
            </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Your Generated Referral Link</p>
          <div className="flex items-center gap-2">
            <Input readOnly value={generatedUrl} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={handleCopyReferral}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg bg-background p-4 text-center">
                <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{profileData.referralCount || 0}</p>
                <p className="text-xs text-muted-foreground">Users Referred</p>
            </div>
             <div className="rounded-lg bg-background p-4 text-center">
                <Wallet className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">₦{(profileData.referralBalance || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Referral Earnings</p>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={!canWithdraw || isWithdrawing}>
              {isWithdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Landmark className="mr-2 h-4 w-4" />}
              Withdraw Earnings
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Withdrawal</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to withdraw ₦{(profileData.referralBalance || 0).toLocaleString()} to the account ending in ****{profileData.accountNumber?.slice(-4)}. This action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleWithdraw}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-xs text-muted-foreground">
          Withdrawals are open from the 16th to 20th of each month. Your balance must be at least ₦{WITHDRAWAL_THRESHOLD.toLocaleString()} and bank details must be verified.
        </p>
      </CardFooter>
    </Card>
  );
}
