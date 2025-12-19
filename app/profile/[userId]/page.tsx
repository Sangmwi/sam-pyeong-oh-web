'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useUserProfile } from '@/lib/hooks/useProfile';
import ProfileHeroSection from '@/components/profile/ProfileHeroSection';
import ProfileLocationCard from '@/components/profile/ProfileLocationCard';
import ProfileBioSection from '@/components/profile/ProfileBioSection';
import ProfileInfoTags from '@/components/profile/ProfileInfoTags';
import ProfileInterestsTags from '@/components/profile/ProfileInterestsTags';
import ProfileInbodySection from '@/components/profile/ProfileInbodySection';
import ProfileMilitarySection from '@/components/profile/ProfileMilitarySection';
import ProfileLocationsSection from '@/components/profile/ProfileLocationsSection';
import FloatingChatButton from '@/components/profile/FloatingChatButton';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  // React Query로 데이터 페칭
  const { data: user, isLoading, error } = useUserProfile(userId);

  const handleBack = () => {
    router.back();
  };

  const handleChat = () => {
    // TODO: Navigate to chat with this user
    router.push(`/chat/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">프로필을 불러올 수 없습니다</p>
          <button
            onClick={handleBack}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border/50">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={handleBack}
            className="p-1 hover:bg-muted/50 rounded-lg transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-6 h-6 text-card-foreground" />
          </button>
          <h1 className="text-base font-bold text-card-foreground">프로필</h1>
          {/* Empty div for layout balance */}
          <div className="w-9" />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-8 space-y-6 pb-32">
        {/* Hero Section */}
        <ProfileHeroSection user={user} />

        {/* Location Card */}
        <ProfileLocationCard
          location={`${user.unitName} 체력단련실 및 연무장`}
        />

        {/* Bio Section */}
        <ProfileBioSection bio={user.bio} />

        {/* Military Info */}
        <ProfileMilitarySection
          rank={user.rank}
          unitName={user.unitName}
          specialty={user.specialty}
        />

        {/* Personal Info */}
        <ProfileInfoTags user={user} />

        {/* Inbody Info */}
        <ProfileInbodySection
          muscleMass={user.muscleMass}
          bodyFatPercentage={user.bodyFatPercentage}
          weight={user.weight}
          showInbodyPublic={user.showInbodyPublic}
        />

        {/* Favorite Locations */}
        <ProfileLocationsSection locations={user.interestedLocations} />

        {/* Interests */}
        <ProfileInterestsTags interests={user.interestedExercises} />
      </div>

      {/* Floating Chat Button - Only shown for other users' profiles */}
      <FloatingChatButton onClick={handleChat} />
    </div>
  );
}
