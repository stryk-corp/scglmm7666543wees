
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { ReportData, UserProfileData } from '@/lib/types';
import ReportPreview from '@/components/report-preview';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, SlidersHorizontal, LogOut, Wallet, User, Loader2, Home, FileDown, ChevronDown, Save, AlertTriangle, Menu, XCircle, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ReportSettingsModal } from '@/components/report-settings-modal';
import { FontSettingsModal } from '@/components/font-settings-modal';
import { MarginSettingsModal } from '@/components/margin-settings-modal';
import { PageNumberSettingsModal } from '@/components/page-number-settings-modal';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PurchasedReport, PurchasedReportsList } from '@/components/purchased-reports-list';
import { useNotification } from '@/context/notification-context';
import { NotificationBell } from '@/components/notification-bell';
import { LoadingLink } from '@/components/ui/loading-link';
import { REPORT_EXPIRATION_DAYS } from '@/lib/config';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { nigerianBanks } from '@/lib/banks';
import { useDebounce } from 'use-debounce';
import { verifyAccountName } from '../actions/verify-account-name';
import { CheckCircle, CircleAlert } from 'lucide-react';
import { ReferralProgramCard } from '@/components/referral-program-card';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AddTestimonialDialog } from '@/components/add-testimonial-dialog';


const TopUpWallet = dynamic(() => import('@/components/top-up-wallet'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>,
});


export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const [profileData, setProfileData] = useState<UserProfileData>({ fullName: '', regNumber: '', universityName: '', facultyName: '', departmentName: '', isReferralActive: false, referralCount: 0, referralBalance: 0, bankName: '', accountNumber: '', accountName: '' });
  const [userBalance, setUserBalance] = useState(0);
  const [formData, setFormData] = useState<ReportData | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [isMarginSettingsOpen, setIsMarginSettingsOpen] = useState(false);
  const [isPageNumberOpen, setIsPageNumberOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PurchasedReport | null>(null);
  const { showNotification } = useNotification();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [debouncedAccountNumber] = useDebounce(profileData.accountNumber, 500);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfileData({
            fullName: data.fullName || user.displayName || '',
            regNumber: data.regNumber || '',
            universityName: data.universityName || '',
            facultyName: data.facultyName || '',
            departmentName: data.departmentName || '',
            isReferralActive: data.isReferralActive || false,
            referralCount: data.referralCount || 0,
            referralBalance: data.referralBalance || 0,
            bankName: data.bankName || '',
            accountNumber: data.accountNumber || '',
            accountName: data.accountName || ''
          });
          setUserBalance(data.balance || 0);
        }
      });
      return () => unsubscribe();
    }
  }, [user, firestore]);
  
  useEffect(() => {
    const verify = async () => {
      if (debouncedAccountNumber && debouncedAccountNumber.length === 10 && profileData.bankName) {
        setIsVerifyingAccount(true);
        setVerificationError(null);
        try {
          const result = await verifyAccountName({
            accountNumber: debouncedAccountNumber,
            bankName: profileData.bankName,
          });
          if (result.success && result.accountName) {
            setProfileData(prev => ({ ...prev, accountName: result.accountName! }));
            showNotification({ title: "Account Verified", message: "Account name has been filled automatically.", type: "success" });
          } else {
            setVerificationError(result.error || 'Could not verify account name.');
            setProfileData(prev => ({...prev, accountName: ''}));
          }
        } catch (error: any) {
          setVerificationError(error.message || 'An unexpected error occurred.');
          setProfileData(prev => ({...prev, accountName: ''}));
        } finally {
          setIsVerifyingAccount(false);
        }
      }
    };
    verify();
  }, [debouncedAccountNumber, profileData.bankName, showNotification]);


  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'accountNumber' && value.length <= 10) {
       setProfileData(prev => ({ ...prev, [id]: value, accountName: '' }));
       setVerificationError(null);
    } else if (id !== 'accountNumber') {
       setProfileData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleBankNameChange = (value: string) => {
    setProfileData(prev => ({ ...prev, bankName: value, accountName: '' }));
    setVerificationError(null);
  };

  const handleSaveChanges = async () => {
    if (!user || !firestore) return;
    setIsSavingChanges(true);

    const dataToUpdate = {
        fullName: profileData.fullName,
        regNumber: profileData.regNumber,
        universityName: profileData.universityName,
        facultyName: profileData.facultyName,
        departmentName: profileData.departmentName,
        bankName: profileData.bankName,
        accountNumber: profileData.accountNumber,
        accountName: profileData.accountName,
    };
    
    const userDocRef = doc(firestore, 'users', user.uid);

    updateDoc(userDocRef, dataToUpdate)
        .then(() => {
            showNotification({ title: "Changes Saved", message: "Your information has been successfully updated.", type: 'success' });
        })
        .catch(async (serverError) => {
            if (serverError.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: dataToUpdate,
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                showNotification({ title: "Error", message: "Could not save your changes.", type: 'error' });
                console.error("Error saving profile:", serverError);
            }
        })
        .finally(() => {
            setIsSavingChanges(false);
        });
  };


  const handleSelectReport = (report: PurchasedReport) => {
    setFormData(report);
    setSelectedReport(report);
    showNotification({ title: 'Report Loaded', message: 'The report is now shown in the preview below.', type: 'info' });
    setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDeselectReport = () => {
    setFormData(null);
    setSelectedReport(null);
    showNotification({ title: 'Selection Cleared', message: 'The report preview has been removed.', type: 'info' });
  };
  
  const handleDownloadPDF = () => {
    if (!selectedReport || !user || !firestore) {
      showNotification({ title: "No Report Selected", message: `Please select a purchased report to download.`, type: 'error' });
      return;
    }
    setIsPreparingDownload(true);
  };

  useEffect(() => {
    if (isPreparingDownload) window.print();
  }, [isPreparingDownload]);

  useEffect(() => {
    const handleAfterPrint = () => setIsPreparingDownload(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleSignOut = async () => {
    if(!auth) return;
    try {
        await auth.signOut();
        router.push('/login');
    } catch (error) {
        showNotification({ title: 'Sign Out Failed', message: 'There was an error signing out.', type: 'error' });
    }
  };

  if (userLoading || !user) {
    return (
      <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-background/85 backdrop-blur-md">
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
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div id="main-container" className="w-full min-h-screen bg-background">
      <AddTestimonialDialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen} />
      {formData && <ReportSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} formData={formData} setFormData={setFormData as React.Dispatch<React.SetStateAction<ReportData>>} onFontSettingsClick={() => setIsFontSettingsOpen(true)} onMarginSettingsClick={() => setIsMarginSettingsOpen(true)} onPageNumberSettingsClick={() => setIsPageNumberOpen(true)} />}
      {formData && <FontSettingsModal isOpen={isFontSettingsOpen} onClose={() => setIsFontSettingsOpen(false)} formData={formData} setFormData={setFormData as React.Dispatch<React.SetStateAction<ReportData>>} />}
      {formData && <MarginSettingsModal isOpen={isMarginSettingsOpen} onClose={() => setIsMarginSettingsOpen(false)} formData={formData} setFormData={setFormData as React.Dispatch<React.SetStateAction<ReportData>>} />}
      {formData && <PageNumberSettingsModal isOpen={isPageNumberOpen} onClose={() => setIsPageNumberOpen(false)} formData={formData} setFormData={setFormData as React.Dispatch<React.SetStateAction<ReportData>>} />}
      <Dialog open={isWalletOpen} onOpenChange={setIsWalletOpen}>
        <DialogContent className="max-w-md p-0 bg-transparent border-0 my-8">
           <DialogHeader>
            <DialogTitle className="sr-only">Top up wallet</DialogTitle>
          </DialogHeader>
          <TopUpWallet
            balance={userBalance}
            onClose={() => setIsWalletOpen(false)}
            onReopen={() => setIsWalletOpen(true)}
            currentUniversity={profileData.universityName}
          />
        </DialogContent>
      </Dialog>
      
      <header id="header-container" className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-8">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="p-2 md:p-4 text-center">
                <div className="flex items-center justify-between">
                    <LoadingLink href="/profile" className="flex items-center gap-3">
                        <Image src="/schverse-logo.png" alt="Scholarverse Logo" width={36} height={36} className="rounded-lg object-contain" priority />
                        <CardTitle className="text-xl md:text-3xl font-bold text-foreground">My Profile</CardTitle>
                    </LoadingLink>
                  
                  {/* Desktop Menu */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsWalletOpen(true)}>
                        <Wallet className="h-5 w-5" />
                        <span className="ml-2">Wallet</span>
                    </Button>
                    <NotificationBell />
                     <LoadingLink href="/generate" variant="outline">
                        <Home className="h-5 w-5" />
                        <span className="ml-2">Generator</span>
                    </LoadingLink>
                     <Button variant="outline" onClick={() => setIsTestimonialDialogOpen(true)}>
                        <MessageSquarePlus className="h-5 w-5" />
                        <span className="ml-2">Add Testimonial</span>
                    </Button>
                    <Button variant="outline" onClick={() => setIsSettingsOpen(!!formData)} disabled={!formData}>
                      <SlidersHorizontal className="h-5 w-5" />
                      <span className="ml-2">Settings</span>
                    </Button>
                    {isPreparingDownload ? (
                        <Button variant="default" disabled>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                           Preparing PDF...
                        </Button>
                    ) : (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" disabled={!selectedReport || isPreparingDownload} title={!selectedReport ? `Select a report to download` : `Download your report`}>
                            <FileDown className="h-5 w-5" />
                            <span className="ml-2">Download</span>
                            <ChevronDown className="h-5 w-5 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleDownloadPDF} disabled={!selectedReport}>
                            <FileDown className="mr-2 h-4 w-4" />
                            <span>Download as PDF</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Mobile Menu */}
                   <div className="flex md:hidden items-center gap-2">
                     <NotificationBell />
                     {selectedReport ? (
                        <>
                           <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
                                <SlidersHorizontal className="h-5 w-5" />
                                <span className="sr-only">Settings</span>
                           </Button>
                           {isPreparingDownload ? (
                             <Button variant="default" size="icon" disabled>
                               <Loader2 className="h-5 w-5 animate-spin" />
                             </Button>
                           ) : (
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                   <Button variant="default" size="icon">
                                       <FileDown className="h-5 w-5" />
                                       <span className="sr-only">Download</span>
                                   </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                   <DropdownMenuItem onClick={handleDownloadPDF}>
                                       <FileDown className="mr-2 h-4 w-4" />
                                       Download as PDF
                                   </DropdownMenuItem>
                               </DropdownMenuContent>
                           </DropdownMenu>
                           )}
                           <Button variant="destructive" size="icon" onClick={handleDeselectReport}>
                               <XCircle className="h-5 w-5" />
                               <span className="sr-only">Clear Selection</span>
                           </Button>
                        </>
                     ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                               <DropdownMenuItem onClick={() => setIsWalletOpen(true)}>
                                   <Wallet className="mr-2 h-4 w-4" />
                                   <span>Wallet</span>
                               </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                   <LoadingLink href="/generate" className="w-full justify-start">
                                       <Home className="mr-2 h-4 w-4" />
                                       <span>Generator</span>
                                   </LoadingLink>
                               </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsTestimonialDialogOpen(true)}>
                                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                                    <span>Add Testimonial</span>
                                </DropdownMenuItem>
                               <DropdownMenuSeparator />
                               <DropdownMenuItem onClick={handleSignOut}>
                                   <LogOut className="mr-2 h-4 w-4" />
                                   <span>Sign Out</span>
                               </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </div>

                </div>
                <CardDescription className="text-muted-foreground mt-2">
                  Manage your profile information and download your purchased reports.
                </CardDescription>
              </CardHeader>
            </Card>
        </div>
      </header>

      <div id="profile-container" className="w-full max-w-6xl mx-auto px-4 sm:px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>This information will be used to auto-fill new reports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={profileData.fullName} onChange={handleProfileInputChange} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="regNumber">Registration Number</Label>
                            <Input id="regNumber" value={profileData.regNumber} onChange={handleProfileInputChange} />
                        </div>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="universityName">University Name</Label>
                        <Input id="universityName" value={profileData.universityName} onChange={handleProfileInputChange} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="facultyName">Faculty Name</Label>
                            <Input id="facultyName" value={profileData.facultyName} onChange={handleProfileInputChange} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="departmentName">Department Name</Label>
                            <Input id="departmentName" value={profileData.departmentName} onChange={handleProfileInputChange} />
                        </div>
                    </div>
                     {profileData.isReferralActive && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="bankName">Bank Name</Label>
                                <Select value={profileData.bankName} onValueChange={handleBankNameChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a bank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {nigerianBanks.map(bank => (
                                            <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <Input id="accountNumber" value={profileData.accountNumber} onChange={handleProfileInputChange} placeholder="e.g., 0123456789"/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="accountName">Account Name</Label>
                                    <div className="relative">
                                        <Input 
                                            id="accountName" 
                                            value={profileData.accountName} 
                                            onChange={handleProfileInputChange}
                                            placeholder="Account name appears here after verification" 
                                            disabled={isVerifyingAccount}
                                            readOnly
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center">
                                            {isVerifyingAccount ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            ) : profileData.accountName ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    {verificationError && (
                                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                            <CircleAlert className="h-3 w-3" />
                                            {verificationError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                     )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveChanges} disabled={isSavingChanges}>
                        {isSavingChanges ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            {profileData.isReferralActive && user && (
              <ReferralProgramCard 
                profileData={profileData} 
                userId={user.uid}
              />
            )}
        </div>
        
        <div className="lg:col-span-3">
          <PurchasedReportsList onSelectReport={handleSelectReport} currentReportId={selectedReport?.id ?? null} />
        </div>
      </div>

      {formData && selectedReport && (
        <div ref={previewRef} className="w-full mt-8 px-4 sm:px-8 z-0 md:z-auto scroll-mt-20">
          <ReportPreview formData={formData} setFormData={setFormData as React.Dispatch<React.SetStateAction<ReportData>>} isPurchased={true} />
        </div>
      )}
    </div>
  );
}
