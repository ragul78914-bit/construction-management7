'use client';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';

export default function SupervisorLayout({ children }) {
  return (
    <AuthGuard role="Supervisor">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
