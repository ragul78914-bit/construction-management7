'use client';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminLayout({ children }) {
  return (
    <AuthGuard role="Admin">
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
