
import type { NextApiRequest, NextApiResponse } from 'next';
import { initiateWithdrawal as initiateWithdrawalAction } from '@/app/actions/initiate-withdrawal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // The server action 'initiateWithdrawalAction' uses `headers()` from `next/headers`,
  // which is only available in the Edge runtime or with Server Components.
  // This API route acts as a bridge. We forward the Authorization header
  // by temporarily modifying the global Headers object prototype.
  
  const originalGet = Headers.prototype.get;
  Headers.prototype.get = function(name: string) {
    if (name.toLowerCase() === 'authorization') {
      return req.headers.authorization || null;
    }
    return originalGet.call(this, name);
  };

  try {
    const result = await initiateWithdrawalAction();
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'An unexpected error occurred.' });
  } finally {
    // Restore the original get method
    Headers.prototype.get = originalGet;
  }
}
