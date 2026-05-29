'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function RootPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isHydrated } = useStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
    } else if (currentUser.role === 'Admin') {
      router.replace('/admin');
    } else if (currentUser.role === 'Supervisor') {
      router.replace('/supervisor');
    } else if (currentUser.role === 'Worker') {
      router.replace('/worker');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, currentUser, router, isHydrated]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0c29' }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading...</div>
    </div>
  );
}
