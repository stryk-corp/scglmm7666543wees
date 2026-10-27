import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { initializeAdminApp } from '@/firebase/admin-init';

export const runtime = 'nodejs';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attemptsByAddress = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const address = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const current = attemptsByAddress.get(address);

  if (current && current.resetAt > now && current.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Try again in 15 minutes.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid sign-in request.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  if (
    !input ||
    typeof input !== 'object' ||
    !('adminPath' in input) ||
    !('password' in input) ||
    typeof input.adminPath !== 'string' ||
    typeof input.password !== 'string' ||
    input.adminPath.length > 200 ||
    input.password.length > 200
  ) {
    return NextResponse.json(
      { error: 'Enter the admin path and password.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const { db, auth } = await initializeAdminApp();
    const configDoc = await db.collection('admin').doc('config').get();
    const config = configDoc.data();
    if (
      !configDoc.exists ||
      config?.secretPath !== input.adminPath ||
      config?.password !== input.password
    ) {
      const attempts = current && current.resetAt > now
        ? { count: current.count + 1, resetAt: current.resetAt }
        : { count: 1, resetAt: now + WINDOW_MS };
      attemptsByAddress.set(address, attempts);
      return NextResponse.json(
        { error: 'Invalid admin path or password.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    attemptsByAddress.delete(address);
    const customToken = await auth.createCustomToken(
      `dashboard-reader-${randomUUID()}`,
      { dashboardReader: true }
    );
    return NextResponse.json(
      { customToken },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Desktop dashboard sign-in failed:', error);
    return NextResponse.json(
      { error: 'Sign-in service is temporarily unavailable.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
