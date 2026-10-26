
'use client';

import { addDoc, collection, doc, getDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface TestimonialData {
    testimonialText: string;
    authorImageUrl?: string;
}

export async function addTestimonial(firestore: Firestore, user: User, data: TestimonialData) {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error("User data not found. Cannot submit testimonial.");
    }
    const userData = userDoc.data();

    const testimonialCollection = collection(firestore, 'testimonials');
    
    await addDoc(testimonialCollection, {
        authorName: userData.fullName || user.displayName || 'Anonymous',
        university: userData.universityName || 'A University',
        testimonialText: data.testimonialText,
        authorImageUrl: data.authorImageUrl || '',
        createdAt: serverTimestamp(),
        userId: user.uid,
    });
}
