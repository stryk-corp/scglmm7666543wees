'use server';

import { initializeAdminApp } from '@/firebase/admin-init';
import { headers } from 'next/headers';
import { z } from 'zod';

const BankDetailsSchema = z.object({
  bankName: z.string().min(3, "Bank name is required."),
  accountNumber: z.string().length(10, "Account number must be 10 digits."),
  accountName: z.string().min(3, "Account name is required."),
});

export async function updateBankDetails(details: z.infer<typeof BankDetailsSchema>) {
  const { auth, db } = await initializeAdminApp();
  const headersList = await headers();
  const token = headersList.get('Authorization')?.split('Bearer ')[1];
  
  if (!token) {
    return { success: false, error: 'Authentication token not provided.' };
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    const parsedDetails = BankDetailsSchema.safeParse(details);
    if (!parsedDetails.success) {
      return { success: false, error: parsedDetails.error.errors[0].message };
    }

    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.update(parsedDetails.data);
    
    return { success: true };

  } catch (error: any) {
    console.error('Error updating bank details:', error);
    if (error.code === 'auth/id-token-expired') {
      return { success: false, error: 'Authentication token has expired.' };
    }
    return { success: false, error: 'Failed to update bank details on the server.' };
  }
}
