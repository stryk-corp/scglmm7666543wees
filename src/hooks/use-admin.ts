'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useUser } from '@/firebase/auth/use-user';

interface UseAdmin {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

export function useAdmin(): UseAdmin {
  const { user, loading: userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    user.getIdTokenResult(true).then((idTokenResult) => {
      const isAdminClaim = !!idTokenResult.claims.admin;
      setIsAdmin(isAdminClaim);
      setLoading(false);
    }).catch(() => {
        setIsAdmin(false);
        setLoading(false);
    });

  }, [user, userLoading]);

  return { user, isAdmin, loading };
}
