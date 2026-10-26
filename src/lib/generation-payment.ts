import {
  doc,
  runTransaction,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import type {ReportData} from '@/lib/types';
import {REPORT_EXPIRATION_DAYS} from '@/lib/config';

type GenerationPayment = NonNullable<ReportData['generationPayment']>;

export async function chargeGeneration(
  firestore: Firestore,
  userId: string,
  draftId: string,
  paymentId: string,
  amount: number,
  documentType: NonNullable<ReportData['documentType']>
): Promise<{charged: boolean; balance: number}> {
  const userRef = doc(firestore, 'users', userId);
  const draftRef = doc(firestore, 'users', userId, 'drafts', draftId);

  return runTransaction(firestore, async (transaction) => {
    const [userSnapshot, draftSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(draftRef),
    ]);

    if (!userSnapshot.exists() || !draftSnapshot.exists()) {
      throw new Error('Your account or report draft could not be found.');
    }

    const currentBalance = Number(userSnapshot.data().balance) || 0;
    const currentPayment = draftSnapshot.data().generationPayment as GenerationPayment | undefined;

    if (currentPayment?.status === 'charged') {
      throw new Error('A report generation payment is already pending.');
    }
    if (currentPayment?.status === 'complete') {
      throw new Error('Save the already-paid report before starting another generation.');
    }
    if (currentBalance < amount) {
      return {charged: false, balance: currentBalance};
    }

    const payment: GenerationPayment = {id: paymentId, amount, status: 'charged', documentType};
    transaction.update(userRef, {balance: currentBalance - amount});
    transaction.update(draftRef, {generationPayment: payment});

    return {charged: true, balance: currentBalance - amount};
  });
}

export async function completeGenerationPayment(
  firestore: Firestore,
  userId: string,
  draftId: string,
  paymentId: string
): Promise<void> {
  const draftRef = doc(firestore, 'users', userId, 'drafts', draftId);

  await runTransaction(firestore, async (transaction) => {
    const draftSnapshot = await transaction.get(draftRef);
    if (!draftSnapshot.exists()) {
      throw new Error('Your report draft could not be found to confirm payment.');
    }

    const payment = draftSnapshot.data().generationPayment as GenerationPayment | undefined;
    if (payment?.id !== paymentId || payment.status !== 'charged') {
      throw new Error('The pending report payment could not be confirmed.');
    }

    transaction.update(draftRef, {
      generationPayment: {...payment, status: 'complete'},
    });
  });
}

export async function refundGenerationPayment(
  firestore: Firestore,
  userId: string,
  draftId: string,
  paymentId: string
): Promise<{refunded: boolean; balance: number}> {
  const userRef = doc(firestore, 'users', userId);
  const draftRef = doc(firestore, 'users', userId, 'drafts', draftId);

  return runTransaction(firestore, async (transaction) => {
    const [userSnapshot, draftSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(draftRef),
    ]);

    if (!userSnapshot.exists() || !draftSnapshot.exists()) {
      throw new Error('Your account or report draft could not be found to process the refund.');
    }

    const currentBalance = Number(userSnapshot.data().balance) || 0;
    const payment = draftSnapshot.data().generationPayment as GenerationPayment | undefined;

    if (payment?.id !== paymentId || payment.status !== 'charged') {
      return {refunded: false, balance: currentBalance};
    }

    const refundedBalance = currentBalance + payment.amount;
    transaction.update(userRef, {balance: refundedBalance});
    transaction.update(draftRef, {
      generationPayment: {...payment, status: 'refunded'},
    });

    return {refunded: true, balance: refundedBalance};
  });
}

export async function savePaidGeneration(
  firestore: Firestore,
  userId: string,
  draftId: string,
  paymentId: string,
  expectedAmount: number,
  expectedDocumentType: NonNullable<ReportData['documentType']>,
  reportData: Omit<ReportData, 'generationPayment'>
): Promise<'saved' | 'already_saved'> {
  const draftRef = doc(firestore, 'users', userId, 'drafts', draftId);
  const reportRef = doc(firestore, 'users', userId, 'reports', paymentId);

  return runTransaction(firestore, async (transaction) => {
    const [draftSnapshot, reportSnapshot] = await Promise.all([
      transaction.get(draftRef),
      transaction.get(reportRef),
    ]);

    if (reportSnapshot.exists()) {
      return 'already_saved';
    }
    if (!draftSnapshot.exists()) {
      throw new Error('Your report draft could not be found.');
    }

    const payment = draftSnapshot.data().generationPayment as GenerationPayment | undefined;
    if (
      payment?.id !== paymentId ||
      payment.status !== 'complete' ||
      payment.amount !== expectedAmount ||
      payment.documentType !== expectedDocumentType
    ) {
      throw new Error('Payment for this generated report could not be verified.');
    }

    const now = Date.now();
    transaction.set(reportRef, {
      ...reportData,
      downloadCount: 3,
      createdAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(now + REPORT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000),
    });
    transaction.delete(draftRef);

    return 'saved';
  });
}
