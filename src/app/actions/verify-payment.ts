'use server';

import { z } from 'zod';
import { initializeAdminApp } from '@/firebase/admin-init';
import { updateSchoolEarnings } from './update-earnings';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const VerifyPaymentInputSchema = z.object({
  reference: z.string(),
  amount: z.number(),
  universityName: z.string(),
  userId: z.string(),
});

export async function verifyPaystackTransaction(input: {
  reference: string;
  amount: number;
  universityName: string;
  userId: string;
}) {
  const parsedInput = VerifyPaymentInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: 'Invalid input for payment verification.' };
  }

  const { reference, amount, universityName, userId } = parsedInput.data;
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY is not defined in environment variables.');
    return { success: false, error: 'Server configuration error.' };
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Important: Don't cache verification requests
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
       return { success: false, error: data.message || 'Transaction verification failed.' };
    }

    const paidAmount = data.data.amount / 100;

    if (paidAmount < amount) {
      return {
        success: false,
        error: `Payment incomplete. Paid: ${paidAmount}, Expected: ${amount}`,
      };
    }

    const { db } = await initializeAdminApp();
    const userDocRef = db.collection('users').doc(userId);
    const transactionsCollectionRef = userDocRef.collection('transactions');

    // Run transaction
    const newBalance = await db.runTransaction(async (t) => {
      const transactionRef = transactionsCollectionRef.doc(reference);
      const userDoc = await t.get(userDocRef);

      if (!userDoc.exists) {
        throw new Error("User document doesn't exist.");
      }
      
      const userData = userDoc.data()!;
      
      // 1. Check for Idempotency
      const existingTx = await t.get(transactionRef);
      if (existingTx.exists) {
        throw new Error('Transaction already processed.');
      }

      // 2. Update User Balance
      const currentBalance = userData.balance || 0;
      const calculatedNewBalance = currentBalance + paidAmount;
      t.update(userDocRef, { balance: calculatedNewBalance });
      
      // 3. Save Transaction Log
      const paidAtDate = new Date(data.data.paid_at);
      const timestamp = !isNaN(paidAtDate.getTime()) ? Timestamp.fromDate(paidAtDate) : Timestamp.now();
      t.set(transactionRef, {
        amount: paidAmount,
        reference: reference,
        status: 'success',
        createdAt: timestamp,
        method: data.data.channel,
        university: universityName
      });

      // 4. Handle Referral Payout (one-time on first payment)
      const transactionsSnapshot = await t.get(transactionsCollectionRef);
      const isFirstTransaction = transactionsSnapshot.size === 0; // The current transaction is not yet committed

      if (userData.referredBy && isFirstTransaction) {
        const referrerRef = db.collection('users').doc(userData.referredBy);
        const referrerDoc = await t.get(referrerRef);
        
        if (referrerDoc.exists) {
            const referrerData = referrerDoc.data()!;
            // Use custom rate if it exists and is valid, otherwise default to 10%
            const commissionRate = (referrerData.referralCommissionRate > 0) ? referrerData.referralCommissionRate / 100 : 0.10;
            const commission = paidAmount * commissionRate;
            t.update(referrerRef, {
              referralBalance: FieldValue.increment(commission),
            });
        }
      }

      return calculatedNewBalance;
    });
      
    // Update school earnings (non-blocking for user response)
    updateSchoolEarnings({ universityName, amount: paidAmount }).catch(e => {
        console.error("Failed to update school earnings, but user balance was updated:", e);
    });

    return { success: true, newBalance };

  } catch (error: any) {
    console.error('Paystack verification error:', error);
    if (error.message === 'Transaction already processed.') {
        return { success: false, error: 'This transaction has already been credited.' };
    }
    return { success: false, error: 'Failed to verify payment.' };
  }
}
