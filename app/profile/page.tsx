'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser, useSignOut } from '@/lib/hooks/useAuth';
import ProfileHeader from '@/components/profile/ProfileHeader';
import BodyInfoSection from '@/components/profile/BodyInfoSection';
import InterestsSection from '@/components/profile/InterestsSection';
import SettingsSection from '@/components/profile/SettingsSection';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();
  const signOutMutation = useSignOut();

  const handleEdit = () => {
    router.push('/profile/edit');
  };

  const handleLogout = async () => {
    try {
      await signOutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">프로필을 불러올 수 없습니다</p>
          <button
            onClick={() => router.push('/login')}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <ProfileHeader user={user} onEdit={handleEdit} />
        <BodyInfoSection user={user} onEdit={handleEdit} />
        <InterestsSection user={user} onEdit={handleEdit} />
        <SettingsSection user={user} onEdit={handleEdit} onLogout={handleLogout} />
      </div>
    </div>
  );
}

