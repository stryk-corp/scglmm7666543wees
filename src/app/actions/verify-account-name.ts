'use server';

import { z } from 'zod';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const VerifyAccountSchema = z.object({
  accountNumber: z.string().length(10, "Account number must be 10 digits."),
  bankName: z.string().min(3, "Bank name is required."),
});

export async function verifyAccountName(input: { accountNumber: string, bankName: string }): Promise<{ success: boolean; accountName?: string; error?: string }> {
  const parsedInput = VerifyAccountSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: parsedInput.error.errors[0].message };
  }
  
  if (!PAYSTACK_SECRET_KEY) {
    console.error('PAYSTACK_SECRET_KEY is not set.');
    return { success: false, error: 'Server configuration error.' };
  }

  const { accountNumber, bankName } = parsedInput.data;

  try {
    // 1. Get bank code from bank name
    const bankListResponse = await fetch('https://api.paystack.co/bank', {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      next: { revalidate: 3600 * 24 } // Cache bank list for 24 hours
    });
    
    const bankListData = await bankListResponse.json();
    if (!bankListData.status) throw new Error('Could not fetch bank list from Paystack.');
    
    const bank = bankListData.data.find((b: any) => b.name.toLowerCase() === bankName.toLowerCase());
    if (!bank) {
      return { success: false, error: 'Invalid bank name.' };
    }
    const bankCode = bank.code;

    // 2. Resolve account number
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status) {
      return { success: false, error: data.message || 'Account verification failed.' };
    }

    return { success: true, accountName: data.data.account_name };

  } catch (error: any) {
    console.error('Error verifying account name:', error);
    return { success: false, error: error.message || 'An unexpected server error occurred.' };
  }
}
