
'use server';

import { initializeAdminApp } from '@/firebase/admin-init';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { normalizeUniversityName } from '@/ai/flows/normalize-university-name';

const UpdateEarningsInputSchema = z.object({
    universityName: z.string(),
    amount: z.number(),
});

export async function updateSchoolEarnings(input: { universityName: string, amount: number }) {
    const parsedInput = UpdateEarningsInputSchema.safeParse(input);
    if (!parsedInput.success) {
        throw new Error('Invalid input for updating school earnings.');
    }

    const { universityName: providedUniversityName, amount } = parsedInput.data;
    
    let normalizedUniversityName = providedUniversityName;

    try {
        // Normalize university name using AI
        const aiResponse = await normalizeUniversityName({ providedName: providedUniversityName });
        normalizedUniversityName = aiResponse.officialName;
        
        const slug = normalizedUniversityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        
        const { db } = await initializeAdminApp();
        const earningsRef = db.collection('schoolEarnings').doc(slug);

        await db.runTransaction(async (transaction) => {
            const earningsDoc = await transaction.get(earningsRef);

            if (!earningsDoc.exists) {
                const dataToWrite = {
                    universityName: normalizedUniversityName,
                    totalEarnings: amount,
                    reportCount: 1,
                    createdAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                };
                transaction.set(earningsRef, dataToWrite);
            } else {
                // Using FieldValue.increment() is safer for concurrent updates
                transaction.update(earningsRef, {
                    totalEarnings: FieldValue.increment(amount),
                    reportCount: FieldValue.increment(1),
                    updatedAt: FieldValue.serverTimestamp(),
                });
            }
        });

        return { success: true, normalizedUniversityName };

    } catch (serverError: any) {
        // Log the actual error on the server for debugging
        console.error(`[updateSchoolEarnings] Failed for ${normalizedUniversityName}:`, serverError);
        
        // Return a structured error response to the client
        return { success: false, error: "Failed to update school earnings on the server.", normalizedUniversityName };
    }
}
