'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { doc, onSnapshot, collection, setDoc, getDocs, query, limit } from 'firebase/firestore';
import ReportForm from '@/components/report-form';
import ReportPreview from '@/components/report-preview';
import type { ReportData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SlidersHorizontal, HelpCircle, LogOut, Wallet, User, Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReportSettingsModal } from '@/components/report-settings-modal';
import { FontSettingsModal } from '@/components/font-settings-modal';
import { MarginSettingsModal } from '@/components/margin-settings-modal';
import { PageNumberSettingsModal } from '@/components/page-number-settings-modal';
import { ReportChecklist } from '@/components/report-checklist';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { normalizeUniversityName } from '@/ai/flows/normalize-university-name';
import { updateSchoolEarnings } from '../actions/update-earnings';
import { useNotification } from '@/context/notification-context';
import { NotificationBell } from '@/components/notification-bell';
import { useDebounce } from 'use-debounce';
import { LoadingLink } from '@/components/ui/loading-link';
import { getDocumentPrice } from '@/lib/config';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  chargeGeneration,
  completeGenerationPayment,
  refundGenerationPayment,
  savePaidGeneration,
} from '@/lib/generation-payment';

const TopUpWallet = dynamic(() => import('@/components/top-up-wallet'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>,
});


const initialFormData: ReportData = {
  documentType: 'siwes_report',
  targetPageCount: 15,
  coverTheme: 'classic-academic',
  academicLevel: 'undergraduate',
  fullName: '',
  regNumber: '',
  universityName: '',
  facultyName: '',
  departmentName: '',
  courseCode: '',
  reportMonth: new Date().toLocaleString('default', { month: 'long' }),
  reportYear: new Date().getFullYear().toString(),
  placeOfAttachment: '',
  attachmentLocation: '',
  supervisorNames: '',
  ceoName: '',
  companyProfile: '',
  scopeOfSpecialization: '',
  companyVision: '',
  companyMission: '',
  companyValues: '',
  organogramImage: [],
  organogramCaption: 'Place of Attachment Organogram',
  organogramAbbreviations: '',
  fieldOfStudy: '',
  primarySkill: '',
  technologiesUsed: '',
  programmingLanguage: '',
  framework: '',
  careerPath: '',
  acknowledgementText: '',
  abstractText: '',
  skillsChapterText: '',
  challengesText: '',
  conclusionText: '',
  referencesText: '',
  attachmentImages: [],
  attachmentCaption: 'Place of Attachment',
  profileImages: [],
  profileCaption: 'Company Office Environment',
  textAlign: 'justify',
  fontFamily: 'Times New Roman',
  fontSize: '12pt',
  lineHeight: '2',
  marginTop: '1in',
  marginRight: '1in',
  marginBottom: '1in',
  marginLeft: '1.25in',
  pageNumberEnabled: true,
  pageNumberPosition: 'bottom-center',
  pageNumberFormat: 'Page {page}',
  referencesEnabled: true,
  referenceStyle: 'APA',
  projectsDescription: "",
  projectIntro: "",
  project1_intro: "",
  project1_desc: "",
  project1_useCaseDiagram: [],
  project1_useCaseCaption: "Use Case Diagram for Project",
  project1_welcomeScreen: "",
  project1_welcomeScreenImages: [],
  project1_welcomeScreenCaption: "A Key Feature or Screen",
  project1_signInScreen: "",
  project1_validation: "",
  project1_signInImages: [],
  project1_signInCaption: "Another Feature or Screen",
  project1_signUpScreen: "",
  project1_signUpImages: [],
  project1_signUpCaption: "Another Part of the Project",
  project1_homeScreen: "",
  project1_homeScreenImages: [],
  project1_homeScreenCaption: "Final State or Main View",
  project1_tools: "",
  project2_intro: "",
  project2_desc: "",
  project2_structure: "",
  project2_ui: "",
  project2_core: "",
  project2_codeSnippetImages: [],
  project2_codeSnippetCaption: "Code Snippet or Diagram",
  project2_tools: ""
};

export default function GeneratePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const [formData, setFormData] = useState<ReportData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [debouncedFormData] = useDebounce(formData, 1000);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [userBalance, setUserBalance] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [isMarginSettingsOpen, setIsMarginSettingsOpen] = useState(false);
  const [isPageNumberSettingsOpen, setIsPageNumberSettingsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const { showNotification } = useNotification();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (!user || !firestore) return;
    
    // Single, unified listener for all user-related data
    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      let currentDraftId = draftId;
      
      // 1. Set Balance and Profile Info
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserBalance(userData.balance || 0);

        // Fetch draft only if we don't have an ID yet
        if (!currentDraftId) {
          const draftsRef = collection(firestore, `users/${user.uid}/drafts`);
          const q = query(draftsRef, limit(1));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const draftDoc = snapshot.docs[0];
            currentDraftId = draftDoc.id;
            setDraftId(draftDoc.id);
            setFormData(draftDoc.data() as ReportData);
            showNotification({ title: 'Draft Loaded', message: 'Your previous progress has been restored.', type: 'info' });
          } else {
            // Create a new draft if none exists
            const newDraftData = {
              ...initialFormData,
              // Pre-fill with user's profile data
              fullName: userData.fullName || user.displayName || '',
              regNumber: userData.regNumber || '',
              universityName: userData.universityName || '',
              facultyName: userData.facultyName || '',
              departmentName: userData.departmentName || '',
            };
            const newDraftRef = doc(collection(firestore, `users/${user.uid}/drafts`));
            await setDoc(newDraftRef, newDraftData);
            currentDraftId = newDraftRef.id;
            setDraftId(newDraftRef.id);
            setFormData(newDraftData);
          }
        }
      } else {
        // Handle case where user document doesn't exist yet (should be rare)
        const newDraftRef = doc(collection(firestore, `users/${user.uid}/drafts`));
        await setDoc(newDraftRef, initialFormData);
        currentDraftId = newDraftRef.id;
        setDraftId(newDraftRef.id);
        setFormData(initialFormData);
      }
    });

    return () => unsubscribe();
  }, [user, firestore, router, showNotification]);


  // Auto-save draft
  useEffect(() => {
    if (user && firestore && draftId && debouncedFormData !== initialFormData) {
      const draftRef = doc(firestore, `users/${user.uid}/drafts`, draftId);
      const {generationPayment: _generationPayment, ...draftFields} = debouncedFormData;
      // Use set with merge to avoid race condition where doc doesn't exist yet
      setDoc(draftRef, draftFields, { merge: true }).catch(error => {
          console.error("Error saving draft:", error);
      });
    }
  }, [debouncedFormData, user, firestore, draftId]);

  const handleStartGeneration = async ({paymentId}: {paymentId: string}) => {
    if (!user || !firestore || !draftId) return false;

    const amount = getDocumentPrice(formData.documentType);
    try {
      const result = await chargeGeneration(
        firestore,
        user.uid,
        draftId,
        paymentId,
        amount,
        formData.documentType || 'term_paper'
      );
      setUserBalance(result.balance);
      if (!result.charged) {
        showNotification({
          title: 'Insufficient Balance',
          message: `Your balance is ₦${result.balance.toLocaleString()}, but ₦${amount.toLocaleString()} is required. Please top up before generating.`,
          type: 'error',
        });
        setIsWalletOpen(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Could not charge for generation:', error);
      let refundFailed = false;
      try {
        const refund = await refundGenerationPayment(firestore, user.uid, draftId, paymentId);
        setUserBalance(refund.balance);
      } catch (refundError) {
        console.error('Could not resolve an uncertain generation charge:', refundError);
        refundFailed = true;
      }
      showNotification({
        title: refundFailed ? 'Payment status needs attention' : 'Payment failed',
        message: error instanceof Error
          ? refundFailed
            ? `${error.message} Generation was not started, but a charge may have been applied. Please contact support.`
            : `${error.message} No generation was started.`
          : refundFailed
            ? 'Generation was not started, but a charge may have been applied. Please contact support.'
            : 'Could not confirm payment. No generation was started.',
        type: 'error',
      });
      return false;
    }
  };

  const handleGenerationCompleted = async (paymentId: string) => {
    if (!user || !firestore || !draftId) throw new Error('Cannot confirm payment without an active report draft.');
    await completeGenerationPayment(firestore, user.uid, draftId, paymentId);
  };

  const handleGenerationFailed = async (paymentId: string) => {
    if (!user || !firestore || !draftId) throw new Error('Cannot refund payment without an active report draft.');
    const result = await refundGenerationPayment(firestore, user.uid, draftId, paymentId);
    setUserBalance(result.balance);
    if (!result.refunded) {
      throw new Error('The payment was no longer in a refundable state.');
    }
  };

  const handleFinalizeAndPay = async (options: { paymentId: string }) => {
    if (!user || !firestore || !draftId) return;

    const payment = formData.generationPayment;
    const baseAmount = getDocumentPrice(formData.documentType);
    const previousBaseAmount = formData.documentType === 'siwes_report' ? 5000 : baseAmount;
    const expectedAmount = payment?.amount;
    if (
      payment?.id !== options.paymentId ||
      payment.status !== 'complete' ||
      payment.documentType !== (formData.documentType || 'term_paper') ||
      expectedAmount === undefined ||
      ![baseAmount, previousBaseAmount, previousBaseAmount + 1000].includes(expectedAmount)
    ) {
      showNotification({
        title: 'Payment could not be verified',
        message: 'This report has not been paid for. Generate it again before saving.',
        type: 'error',
      });
      return;
    }

    setIsFinalizing(true);
    try {
      const { officialName } = await normalizeUniversityName({ providedName: formData.universityName });
      const { generationPayment: _generationPayment, ...reportFields } = formData;
      const saveStatus = await savePaidGeneration(
        firestore,
        user.uid,
        draftId,
        options.paymentId,
        expectedAmount,
        formData.documentType || 'term_paper',
        {...reportFields, universityName: officialName}
      );

      if (typeof window !== 'undefined') {
        localStorage.setItem(`generated_today_${user.uid}`, new Date().toISOString().slice(0, 10));
      }
      if (saveStatus === 'saved') {
        await updateSchoolEarnings({ universityName: officialName, amount: expectedAmount });
      }
      showNotification({
        title: 'Report Saved',
        message: 'Your paid report is saved. You can download it from your profile.',
        type: 'success',
      });
      router.push('/profile');
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}/reports and users/${user.uid}/drafts`,
          operation: 'update',
          requestResourceData: {paymentId: options.paymentId, amount: expectedAmount},
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        console.error('Save paid report failed:', error);
        showNotification({
          title: 'Could not save report',
          message: 'Your payment remains applied to this report. Please retry saving; do not generate it again.',
          type: 'error',
        });
      }
    } finally {
      setIsFinalizing(false);
    }
  };


  const handleSignOut = async () => {
    if(!auth) return;
    try {
        await auth.signOut();
        router.push('/login');
    } catch (error) {
        showNotification({
            title: 'Sign Out Failed',
            message: 'There was an error signing out.',
            type: 'error'
        });
    }
  };
  
  if (loading || !user || !draftId) {
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
                  Loading Scholarverse...
                </p>
                <p className="text-xs text-muted-foreground">Please wait a moment</p>
            </div>
        </div>
    );
  }

  return (
    <div id="main-container" className="w-full min-h-screen bg-background">
      <ReportSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onFontSettingsClick={() => setIsFontSettingsOpen(true)}
        onMarginSettingsClick={() => setIsMarginSettingsOpen(true)}
        onPageNumberSettingsClick={() => setIsPageNumberSettingsOpen(true)}
      />
      <FontSettingsModal
        isOpen={isFontSettingsOpen}
        onClose={() => setIsFontSettingsOpen(false)}
        formData={formData}
        setFormData={setFormData}
      />
      <MarginSettingsModal
        isOpen={isMarginSettingsOpen}
        onClose={() => setIsMarginSettingsOpen(false)}
        formData={formData}
        setFormData={setFormData}
      />
      <PageNumberSettingsModal
        isOpen={isPageNumberSettingsOpen}
        onClose={() => setIsPageNumberSettingsOpen(false)}
        formData={formData}
        setFormData={setFormData}
      />
      <Dialog open={isWalletOpen} onOpenChange={setIsWalletOpen}>
        <DialogContent className="max-w-md p-0 bg-transparent border-0 my-8">
          <DialogHeader>
            <DialogTitle className="sr-only">Top up wallet</DialogTitle>
          </DialogHeader>
          <TopUpWallet
            balance={userBalance}
            onClose={() => setIsWalletOpen(false)}
            onReopen={() => setIsWalletOpen(true)}
            currentUniversity={formData.universityName}
          />
        </DialogContent>
      </Dialog>
      
      <ReportChecklist
        formData={formData}
        onJumpToStep={(step, requiresDetailedMode) => {
          setIsDetailedMode(requiresDetailedMode);
          setCurrentStep(step);
        }}
      />
      
      <header id="header-container" className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-8">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="p-2 md:p-4 text-center">
                <div className="flex items-center justify-between">
                  <LoadingLink href="/" className="flex items-center gap-3">
                    <Image src="/schverse-logo.png" alt="Scholarverse Logo" width={36} height={36} className="rounded-lg object-contain" priority />
                    <CardTitle className="text-xl md:text-3xl font-bold text-foreground">Scholarverse</CardTitle>
                  </LoadingLink>
                  
                  {/* Desktop Menu */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsWalletOpen(true)}>
                        <Wallet className="h-5 w-5" />
                        <span className="ml-2">Wallet</span>
                    </Button>
                    <NotificationBell />
                    <LoadingLink href="/how-to-use" variant="outline">
                      <HelpCircle className="h-5 w-5" />
                      <span className="ml-2">How to Use</span>
                    </LoadingLink>
                    <LoadingLink href="/profile" variant="outline">
                      <User className="h-5 w-5" />
                      <span className="ml-2">Profile</span>
                    </LoadingLink>
                    <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
                      <SlidersHorizontal className="h-5 w-5" />
                      <span className="ml-2">Settings</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mobile Menu */}
                  <div className="flex md:hidden items-center gap-2">
                     <NotificationBell />
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
                                <LoadingLink href="/profile" className="w-full justify-start">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </LoadingLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <LoadingLink href="/how-to-use" className="w-full justify-start">
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    <span>How to Use</span>
                                </LoadingLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground mt-2">
                  Fill in your details, and let AI help you write the perfect report.
                </CardDescription>
              </CardHeader>
            </Card>
        </div>
      </header>

      <div id="form-container" className="w-full max-w-4xl mx-auto px-4 sm:px-8">
        <ReportForm 
          formData={formData} 
          setFormData={setFormData} 
          onStartGeneration={handleStartGeneration}
          onGenerationCompleted={handleGenerationCompleted}
          onGenerationFailed={handleGenerationFailed}
          onFinalizeAndPay={handleFinalizeAndPay} 
          isFinalizing={isFinalizing}
          isEditingPurchased={false} // This form is for creation only now
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isDetailedMode={isDetailedMode}
          setIsDetailedMode={setIsDetailedMode}
        />
      </div>

      <div className="w-full mt-8 px-4 sm:px-8 z-0 md:z-auto">
        <ReportPreview formData={formData} setFormData={setFormData} isPurchased={false} />
      </div>
    </div>
  );
}
