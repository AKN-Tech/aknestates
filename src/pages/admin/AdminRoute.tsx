import { useAdminAuth } from '@/lib/admin-auth';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { Loader2 } from 'lucide-react';

export function AdminRoute() {
  const { session, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest-700">
        <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
      </div>
    );
  }

  if (!session) {
    return <AdminLoginPage />;
  }

  return <AdminDashboardPage />;
}
