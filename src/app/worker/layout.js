'use client';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';

export default function WorkerLayout({ children }) {
  return (
    <AuthGuard role="Worker">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
