import { Metadata } from 'next';
import AuthGuard from '../../../components/auth/AuthGuard';
import AdminGuard from '../../../components/auth/AdminGuard';
import PromptsListClient from '../../../components/prompts/PromptsListClient';

export const metadata: Metadata = {
  title: 'Prompt Management - FisSales Admin',
  description: 'Manage AI prompts for the FisSales system',
};

export default function PromptsPage() {
  return (
    <AuthGuard>
      <AdminGuard>
        <PromptsListClient />
      </AdminGuard>
    </AuthGuard>
  );
}
