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
      return;
    }
    // Role check: Admin can access any panel.
    // Other roles can only access their own panel.
    if (role && currentUser.role !== 'Admin' && currentUser.role !== role) {
      router.replace('/login');
    }
  }, [isAuthenticated, currentUser, role, router, mounted]);

  if (!mounted || !isAuthenticated || !currentUser) return null;
  // Block non-admin users from accessing wrong panel
  if (role && currentUser.role !== 'Admin' && currentUser.role !== role) return null;

  return children;
}
