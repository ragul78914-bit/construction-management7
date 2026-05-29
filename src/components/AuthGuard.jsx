'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function AuthGuard({ children, role }) {
  const router = useRouter();
  const { currentUser, isAuthenticated, isHydrated } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isHydrated) return;
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
    } else if (role && currentUser.role !== role) {
      router.replace('/');
    }
  }, [isAuthenticated, currentUser, role, router, mounted, isHydrated]);

  if (!mounted || !isHydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0c29' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) return null;
  if (role && currentUser.role !== role) return null;

  return children;
}
