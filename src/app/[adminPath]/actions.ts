

'use server';

import { initializeAdminApp } from '@/firebase/admin-init';
import { UserRecord } from 'firebase-admin/auth';
import { ReportData, UserProfileData } from '@/lib/types';
import { format } from 'date-fns';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { headers } from 'next/headers';

interface UserData extends UserProfileData {
    uid: string;
    email: string;
    balance: number;
}

interface EligibleUser {
  uid: string;
  fullName: string;
  email: string;
  referralBalance: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface SchoolEarning {
    id: string;
    universityName: string;
    totalEarnings: number;
    reportCount: number;
}

interface AdminNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

async function verifySecretPath(secretPath: string): Promise<boolean> {
    const { db } = await initializeAdminApp();
    try {
        const configDoc = await db.collection('admin').doc('config').get();
        if (configDoc.exists && configDoc.data()?.secretPath === secretPath) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error verifying secret path:", error);
        return false;
    }
}

export async function verifyAdminPassword(password: string, secretPath: string): Promise<{ success: boolean; token?: string; error?: string }> {
    if (!(await verifySecretPath(secretPath))) {
        return { success: false, error: 'Invalid admin path.' };
    }
    
    try {
        const { db, auth } = await initializeAdminApp();
        const configDoc = await db.collection('admin').doc('config').get();

        if (!configDoc.exists) {
            return { success: false, error: 'Admin configuration not found.' };
        }

        const correctPassword = configDoc.data()?.password;

        if (password === correctPassword) {
            // The UID for the custom token can be a static or random string.
            // It identifies this admin session.
            const uid = `admin-session-${randomUUID()}`;
            const customToken = await auth.createCustomToken(uid, { admin: true });
            return { success: true, token: customToken };
        } else {
            return { success: false, error: 'Invalid password.' };
        }
    } catch (error) {
        console.error('Error verifying admin password:', error);
        return { success: false, error: 'Server error during authentication.' };
    }
}


export async function addGlobalNotification(data: { title: string; body: string }) {
    try {
        const { db } = await initializeAdminApp();
        await db.collection('globalNotifications').add({
            title: data.title,
            body: data.body,
            createdAt: FieldValue.serverTimestamp(),
            icon: 'Info', 
            type: 'info',
        });
        return { success: true };
    } catch (error) {
        console.error('Error adding global notification:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateGlobalNotification(id: string, data: { title: string; body: string }) {
    try {
        const { db } = await initializeAdminApp();
        await db.collection('globalNotifications').doc(id).update({
            title: data.title,
            body: data.body,
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating global notification:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteGlobalNotification(id: string) {
    try {
        const { db } = await initializeAdminApp();
        await db.collection('globalNotifications').doc(id).delete();
        return { success: true };
    } catch (error) {
        console.error('Error deleting global notification:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const { db, auth } = await initializeAdminApp();
    const [userRecords, userDocs] = await Promise.all([
        auth.listUsers(),
        db.collection('users').get()
    ]);

    const usersData: { [uid: string]: any } = {};
    userDocs.forEach(doc => {
        usersData[doc.id] = doc.data();
    });

    const regularUsers = userRecords.users.filter(user => !user.uid.startsWith('admin-session-'));

    return regularUsers.map((user: UserRecord) => ({
      uid: user.uid,
      email: user.email || 'N/A',
      fullName: usersData[user.uid]?.fullName || user.displayName || 'N/A',
      regNumber: usersData[user.uid]?.regNumber || 'N/A',
      universityName: usersData[user.uid]?.universityName || 'N/A',
      facultyName: usersData[user.uid]?.facultyName || 'N/A',
      departmentName: usersData[user.uid]?.departmentName || 'N/A',
      balance: usersData[user.uid]?.balance || 0,
      isReferralActive: usersData[user.uid]?.isReferralActive || false,
      referralCount: usersData[user.uid]?.referralCount || 0,
      referralBalance: usersData[user.uid]?.referralBalance || 0,
      referralCommissionRate: usersData[user.uid]?.referralCommissionRate,
      referredBy: usersData[user.uid]?.referredBy || null,
      bankName: usersData[user.uid]?.bankName || '',
      accountNumber: usersData[user.uid]?.accountNumber || '',
      accountName: usersData[user.uid]?.accountName || '',
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export async function getEligibleForWithdrawalUsers(): Promise<EligibleUser[]> {
    try {
        const { db } = await initializeAdminApp();
        const usersSnapshot = await db.collection('users').where('referralBalance', '>=', 20000).get();
        
        if (usersSnapshot.empty) {
            return [];
        }

        const eligibleUsers: EligibleUser[] = [];
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            eligibleUsers.push({
                uid: doc.id,
                fullName: data.fullName || 'N/A',
                email: data.email || 'N/A',
                referralBalance: data.referralBalance || 0,
                bankName: data.bankName || 'N/A',
                accountNumber: data.accountNumber || 'N/A',
                accountName: data.accountName || 'N/A',
            });
        });

        return eligibleUsers;
    } catch (error) {
        console.error('Error fetching eligible users for withdrawal:', error);
        return [];
    }
}

export async function getUserReports(userId: string): Promise<(ReportData & {id: string})[]> {
    try {
        const { db } = await initializeAdminApp();
        const reportsSnapshot = await db.collection(`users/${userId}/reports`).get();
        
        const reports = await Promise.all(reportsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Timestamps to serializable format
                createdAt: data.createdAt ? await formatReportDate(data.createdAt as Timestamp) : 'N/A',
                expiresAt: data.expiresAt ? await formatReportDate(data.expiresAt as Timestamp) : 'N/A',
            };
        }));

        return reports as unknown as (ReportData & {id: string})[];
    } catch (error) {
        console.error(`Error fetching reports for user ${userId}:`, error);
        return [];
    }
}


export async function updateUserData(userId: string, data: Partial<UserProfileData & { balance: number }>) {
    const { db, auth } = await initializeAdminApp();

    const headersList = await headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
        return { success: false, error: 'Authentication token not provided.' };
    }

    try {
        const decodedToken = await auth.verifyIdToken(token);
        if (!decodedToken.admin) {
            return { success: false, error: 'User is not an admin.' };
        }
        
        const userDocRef = db.collection('users').doc(userId);
        
        const updateData: { [key: string]: any } = { ...data };

        // Handle referral activation notification
        if (data.isReferralActive === true) {
            const userDoc = await userDocRef.get();
            const currentData = userDoc.data();
            if (!currentData || currentData.isReferralActive === false) {
                 const notificationsRef = userDocRef.collection('notifications');
                 const newNotifRef = notificationsRef.doc();
                 await newNotifRef.set({
                    title: 'Your Referral Program is Active!',
                    body: 'You can now earn rewards by sharing your unique referral link. Find it in your profile.',
                    icon: 'Gift',
                    type: 'success',
                    createdAt: FieldValue.serverTimestamp(),
                    isRead: false,
                });
            }
        }
        
        await userDocRef.update(updateData);
        
        return { success: true };
    } catch (error) {
        console.error(`Error updating data for user ${userId}:`, error);
        return { success: false, error: (error as Error).message };
    }
}


export async function getAllReports(): Promise<(ReportData & {id: string, user: {uid: string, name: string}, createdAt: string, expiresAt: string})[]> {
    try {
        const { db } = await initializeAdminApp();
        const reportsSnapshot = await db.collectionGroup('reports').get();
        
        const reports = await Promise.all(reportsSnapshot.docs.map(async (doc) => {
            const data = doc.data() as ReportData;
            const pathParts = doc.ref.path.split('/');
            const userId = pathParts[1]; 
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? await formatReportDate(data.createdAt as Timestamp) : 'N/A',
                expiresAt: data.expiresAt ? await formatReportDate(data.expiresAt as Timestamp) : 'N/A',
                user: {
                    uid: userId,
                    name: data.fullName
                }
            };
        }));
        return reports as (ReportData & {id: string, user: {uid: string, name: string}, createdAt: string, expiresAt: string})[];
    } catch (error) {
        console.error('Error fetching all reports:', error);
        return [];
    }
}

export async function updateReportData(userId: string, reportId: string, data: { downloadCount: number }) {
    try {
        const { db } = await initializeAdminApp();
        await db.collection(`users/${userId}/reports`).doc(reportId).update(data);
        return { success: true };
    } catch (error) {
        console.error(`Error updating report ${reportId} for user ${userId}:`, error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getSchoolEarnings(): Promise<SchoolEarning[]> {
    try {
        const { db } = await initializeAdminApp();
        const earningsSnapshot = await db.collection('schoolEarnings').get();
        return earningsSnapshot.docs.map(doc => ({
            id: doc.id,
            universityName: doc.data().universityName,
            totalEarnings: doc.data().totalEarnings,
            reportCount: doc.data().reportCount,
        }));
    } catch (error) {
        console.error('Error fetching school earnings:', error);
        return [];
    }
}

export async function getAllGlobalNotifications(): Promise<AdminNotification[]> {
  try {
    const { db } = await initializeAdminApp();
    const notificationsSnapshot = await db.collection('globalNotifications').orderBy('createdAt', 'desc').get();

    return Promise.all(notificationsSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        body: data.body,
        createdAt: await formatReportDate(data.createdAt),
      };
    }));
  } catch (error) {
    console.error('Error fetching global notifications:', error);
    return [];
  }
}

export async function formatReportDate(date: Date | Timestamp): Promise<string> {
    if (!date) return 'N/A';
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return format(dateObj, 'PPp');
}

export async function getAdminPath(): Promise<string | null> {
    try {
        const { db } = await initializeAdminApp();
        const configDoc = await db.collection('admin').doc('config').get();
        if (configDoc.exists) {
            return configDoc.data()?.secretPath || null;
        }
        return null;
    } catch (error) {
        console.error("Error fetching admin path:", error);
        return null;
    }
}
    

    





