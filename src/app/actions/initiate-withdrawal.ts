
'use server';

import { initializeAdminApp } from '@/firebase/admin-init';
import { headers } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const WITHDRAWAL_THRESHOLD = 20000;

const BankSchema = z.object({
  bankName: z.string().min(3, "Bank name is required."),
  accountNumber: z.string().length(10, "Account number must be 10 digits."),
  accountName: z.string().min(3, "Account name is required."),
});

async function getCurrentUserId() {
    // This is a placeholder for getting the current user's ID on the server.
    // In a real app with NextAuth.js or similar, you'd get this from the session.
    // For this context, we will assume an admin SDK is being used and UID is passed.
    // A more robust solution might involve custom tokens or session management.
    // Since this is a server action, getting the user from client context is not direct.
    // We will simulate this by requiring the UID to be passed in a real scenario,
    // but for now, we'll need to adapt. Let's assume we can get it from a session eventually.
    // For now, this is a limitation.
    // Let's assume the client passes the uid for this server action.
    return null; // This needs to be implemented based on auth strategy
}


export async function initiateWithdrawal() {
    // Enforce withdrawal window
    const today = new Date();
    const dayOfMonth = today.getDate();
    if (dayOfMonth < 16 || dayOfMonth > 20) {
        return { success: false, error: 'Withdrawals are only processed between the 16th and 20th of each month.' };
    }

    if (!PAYSTACK_SECRET_KEY) {
        console.error('PAYSTACK_SECRET_KEY is not defined.');
        return { success: false, error: 'Server configuration error.' };
    }

    const { db, auth } = await initializeAdminApp();
    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
        return { success: false, error: 'Authentication token not provided.' };
    }
    
    let decodedToken;
    try {
        decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
        return { success: false, error: 'Invalid authentication token.' };
    }

    const userId = decodedToken.uid;
    const userRef = db.collection('users').doc(userId);

    try {
        const result = await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User not found.');
            }

            const userData = userDoc.data()!;
            const balance = userData.referralBalance || 0;

            const bankDetails = BankSchema.safeParse({
                bankName: userData.bankName,
                accountNumber: userData.accountNumber,
                accountName: userData.accountName
            });

            if (!bankDetails.success) {
                throw new Error('Bank details are incomplete or invalid.');
            }

            if (balance < WITHDRAWAL_THRESHOLD) {
                throw new Error(`Insufficient balance. Minimum withdrawal is ₦${WITHDRAWAL_THRESHOLD.toLocaleString()}.`);
            }

            // Paystack logic
            // 1. Resolve Account Number to get bank code if needed (or assume user provides it)
            // For simplicity, we'll assume we need to find the bank code first.
            // This is a good practice to verify the bank.
            const bankListResponse = await fetch('https://api.paystack.co/bank', {
                headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
            });
            const bankListData = await bankListResponse.json();
            if(!bankListData.status) throw new Error('Could not fetch bank list from Paystack.');

            const bank = bankListData.data.find((b: any) => b.name.toLowerCase() === bankDetails.data.bankName.toLowerCase());
            if (!bank) {
                throw new Error('Bank not supported by Paystack or invalid bank name.');
            }

            // 2. Create Transfer Recipient
            const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'nuban',
                    name: bankDetails.data.accountName,
                    account_number: bankDetails.data.accountNumber,
                    bank_code: bank.code,
                    currency: 'NGN',
                }),
            });
            const recipientData = await recipientResponse.json();
            if (!recipientData.status) {
                throw new Error(recipientData.message || 'Failed to create transfer recipient with Paystack.');
            }

            const recipientCode = recipientData.data.recipient_code;
            const amountToWithdrawKobo = balance * 100;

            // 3. Initiate Transfer
            const transferResponse = await fetch('https://api.paystack.co/transfer', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'balance',
                    amount: amountToWithdrawKobo,
                    recipient: recipientCode,
                    reason: `Scholarverse Referral Payout for ${userData.fullName}`,
                }),
            });
            const transferData = await transferResponse.json();
             if (!transferData.status) {
                throw new Error(transferData.message || 'Paystack transfer initiation failed.');
            }

            // 4. Update user's balance in the transaction
            t.update(userRef, {
                referralBalance: 0,
            });
            
            // 5. Log the withdrawal transaction
            const withdrawalLogRef = userRef.collection('transactions').doc();
             t.set(withdrawalLogRef, {
                amount: balance,
                type: 'withdrawal',
                status: 'success',
                createdAt: FieldValue.serverTimestamp(),
                paystackReference: transferData.data.reference,
            });

            return { newBalance: 0 };
        });

        return { success: true, newBalance: result.newBalance };

    } catch (error: any) {
        console.error('Withdrawal transaction failed:', error);
        return { success: false, error: error.message || 'A server error occurred during withdrawal.' };
    }
}
