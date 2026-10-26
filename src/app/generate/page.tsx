'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { doc, onSnapshot, collection, setDoc, getDocs, query, limit } from 'firebase/firestore';
import ReportForm from '@/components/report-form';
import ReportPreview from '@/components/report-preview';
import type { ReportData } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { AddTestimonialDialog } from '@/components/add-testimonial-dialog';
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
  reportTitle: '',
  thesisStatement: '',
  researchQuestions: '',
  methodologyType: 'Systematic Literature Review',
  theoreticalFramework: '',
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
  const [debouncedFormData] = useDebounce(formData, 1000);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const [userBalance, setUserBalance] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [isMarginSettingsOpen, setIsMarginSettingsOpen] = useState(false);
  const [isPageNumberSettingsOpen, setIsPageNumberSettingsOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const { showNotification } = useNotification();

  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const textField =
      'textarea, select, [contenteditable="true"], input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="file"])';
    const onIn = (e: FocusEvent) => setTyping(e.target instanceof HTMLElement && e.target.matches(textField));
    const onOut = () => setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

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

  const totalSteps = isDetailedMode ? 7 : 3;
  const displayStep = isDetailedMode ? currentStep : currentStep === 7 ? 3 : currentStep;
  const progress = Math.min(100, Math.round((displayStep / totalSteps) * 100));
  const initial = (user?.displayName || user?.email || '?').trim().charAt(0).toUpperCase();

  const switchTab = (tab: 'form' | 'preview') => {
    setMobileTab(tab);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  // Shared styles. Quiet text controls, no boxes until hover.
  const textButton =
    'inline-flex h-9 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const menuItem = 'cursor-pointer rounded-lg px-3 py-2.5 text-sm';
  const gutter = 'px-[clamp(1.25rem,5vw,3rem)]';

  if (loading || !user || !draftId) {
    return (
      <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6">
        <div className="sv-fade flex flex-col items-center gap-3 text-center">
          <Image
            src="/schverse-loader.gif"
            alt=""
            width={72}
            height={72}
            className="h-16 w-16 object-contain"
            unoptimized
            priority
          />
          <p className="font-serif text-lg text-foreground">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="main-container"
      className="min-h-[100dvh] w-full overflow-x-clip bg-background text-foreground [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)]"
    >
      <AddTestimonialDialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen} />
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
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto border-0 bg-transparent p-0">
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
          setMobileTab('form');
          const formEl = document.getElementById('form-container');
          if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Header: flat, hairline underneath, words instead of icons. The brand mark is the only image. */}
      <header id="header-container" className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-[1800px] items-center justify-between gap-3 px-4 sm:px-6 xl:px-8">
          <LoadingLink href="/" className="flex min-w-0 items-center gap-2.5">
            <Image src="/schverse-logo.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" priority />
            <span className="hidden truncate font-serif text-[1.35rem] leading-none tracking-tight min-[420px]:inline">
              Scholarverse
            </span>
          </LoadingLink>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsWalletOpen(true)}
              aria-label={`Open wallet, balance ₦${userBalance.toLocaleString()}`}
              className={cn(textButton, 'gap-2 px-3')}
            >
              <span className="hidden text-muted-foreground sm:inline">Balance</span>
              <span key={userBalance} className="sv-tick font-medium tabular-nums text-foreground">
                ₦{userBalance.toLocaleString()}
              </span>
            </button>

            <NotificationBell />

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className={cn(textButton, 'hidden sm:inline-flex')}
            >
              Document settings
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-60 max-w-[calc(100vw-1.5rem)] rounded-xl p-1.5 shadow-md">
                <div className="px-3 pb-2 pt-1.5">
                  <p className="truncate text-sm font-medium">{user.displayName || 'Your account'}</p>
                  {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className={menuItem}>
                  <LoadingLink href="/profile">Profile and reports</LoadingLink>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className={cn(menuItem, 'sm:hidden')}>
                  Document settings
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={menuItem}>
                  <LoadingLink href="/how-to-use">How to use</LoadingLink>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsTestimonialDialogOpen(true)} className={menuItem}>
                  Share a testimonial
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className={menuItem}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/*
        Workspace
          below 1280px: one pane at a time, switched from the bottom control
          1280px and up: form on the left, preview pinned on the right on a slightly deeper tone
      */}
      <main className="mx-auto grid w-full max-w-[1800px] xl:grid-cols-[minmax(32rem,42rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(36rem,46rem)_minmax(0,1fr)]">
        <div
          id="form-container"
          className={cn(
            'sv-fade min-w-0 pb-32 pt-8 sm:pt-10 xl:px-10 xl:pb-20',
            gutter,
            mobileTab === 'form' ? 'block' : 'hidden xl:block'
          )}
        >
          <div className="mx-auto w-full min-w-0 max-w-2xl xl:max-w-none">
            {/* Where you are, said plainly, with a single thin line of progress */}
            <div className="mb-8">
              <div className="flex items-baseline justify-between gap-4">
                <h1 className="font-serif text-2xl tracking-tight sm:text-[1.75rem]">Write your report</h1>
                <p className="text-sm tabular-nums text-muted-foreground">
                  Step {displayStep} of {totalSteps}
                </p>
              </div>
              <div
                role="progressbar"
                aria-label="Report progress"
                aria-valuemin={1}
                aria-valuemax={totalSteps}
                aria-valuenow={displayStep}
                className="mt-4 h-px w-full bg-border"
              >
                <div
                  className="h-[2px] -translate-y-px rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

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
        </div>

        <section
          aria-label="Document preview"
          className={cn(
            'min-w-0 border-border bg-muted/50 xl:sticky xl:top-14 xl:h-[calc(100dvh-3.5rem)] xl:overflow-y-auto xl:overscroll-contain xl:border-l',
            mobileTab === 'preview' ? 'block min-h-[calc(100dvh-3.5rem)]' : 'hidden xl:block'
          )}
        >
          <div className={cn('pb-32 pt-8 sm:pt-10 xl:px-8 xl:pb-12', gutter)}>
            <div className="mx-auto w-full min-w-0 max-w-4xl">
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-xl tracking-tight">Preview</h2>
                <p className="text-xs text-muted-foreground">Updates as you type</p>
              </div>
              {/* A fixed-width paper scrolls inside this frame instead of widening the page */}
              <div className="min-w-0 overflow-x-auto">
                <ReportPreview formData={formData} setFormData={setFormData} isPurchased={false} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Phone and tablet: two words, one control. Slides away while a text field is focused. */}
      <nav
        aria-label="Workspace view"
        aria-hidden={typing}
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-all duration-300 xl:hidden',
          typing && 'translate-y-24 opacity-0'
        )}
      >
        <div
          role="tablist"
          className={cn(
            'relative grid w-[min(16rem,calc(100vw-2rem))] grid-cols-2 rounded-full border border-border bg-background p-1 shadow-md',
            typing ? 'pointer-events-none' : 'pointer-events-auto'
          )}
        >
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-muted transition-transform duration-300 ease-out"
            style={{ transform: mobileTab === 'preview' ? 'translateX(100%)' : 'translateX(0)' }}
          />
          {([
            { id: 'form', label: 'Write' },
            { id: 'preview', label: 'Preview' },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mobileTab === id}
              tabIndex={typing ? -1 : 0}
              onClick={() => switchTab(id)}
              className={cn(
                'relative z-10 h-10 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                mobileTab === id ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
