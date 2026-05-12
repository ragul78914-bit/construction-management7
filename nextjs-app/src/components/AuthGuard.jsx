'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function AuthGuard({ children, role }) {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useStore();

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
    } else if (role && currentUser.role !== role) {
      router.replace('/');
    }
  }, [isAuthenticated, currentUser, role, router]);

  if (!isAuthenticated || !currentUser) return null;
  if (role && currentUser.role !== role) return null;

  return children;
}
