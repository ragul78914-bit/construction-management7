'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function AuthGuard({ children, role }) {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
    } else if (role && currentUser.role !== role) {
      router.replace('/');
    }
  }, [isAuthenticated, currentUser, role, router, mounted]);

  if (!mounted || !isAuthenticated || !currentUser) return null;
  if (role && currentUser.role !== role) return null;

  return children;
}
