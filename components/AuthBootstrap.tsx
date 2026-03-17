'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function AuthBootstrap() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  return null;
}
