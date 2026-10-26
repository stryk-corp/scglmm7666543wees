'use server';

import { initializeAdminApp } from '@/firebase/admin-init';
import { FieldValue } from 'firebase-admin/firestore';

export async function applySignupReferral(
  idToken: string,
  referralCode: string
): Promise<'applied' | 'invalid' | 'already-applied'> {
  const code = referralCode.trim();
  if (!code) return 'invalid';

  const { auth, db } = await initializeAdminApp();
  const decodedToken = await auth.verifyIdToken(idToken);
  const newUserRef = db.collection('users').doc(decodedToken.uid);
  const referrerRef = db.collection('users').doc(code);
  let result: 'applied' | 'invalid' | 'already-applied' = 'invalid';

  await db.runTransaction(async (transaction) => {
    const [newUser, referrer] = await Promise.all([
      transaction.get(newUserRef),
      transaction.get(referrerRef),
    ]);

    if (!newUser.exists) {
      throw new Error('The new user profile has not been created.');
    }

    const existingReferrer = newUser.get('referredBy');
    if (existingReferrer === code) {
      result = 'already-applied';
      return;
    }

    if (
      !referrer.exists ||
      referrer.get('isReferralActive') !== true ||
      referrer.id === decodedToken.uid ||
      (existingReferrer !== null && existingReferrer !== undefined)
    ) {
      result = 'invalid';
      return;
    }

    transaction.update(newUserRef, { referredBy: code });
    transaction.update(referrerRef, {
      referralCount: FieldValue.increment(1),
    });
    result = 'applied';
  });

  return result;
}
