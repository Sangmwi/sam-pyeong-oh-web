import MainTabLayout from '@/components/common/MainTabLayout';
import AIHeroSection from '@/components/ai/AIHeroSection';
import AICameraView from '@/components/ai/AICameraView';
import AIFeaturesGrid from '@/components/ai/AIFeaturesGrid';

export default function AIPage() {
  return (
    <MainTabLayout>
      <AIHeroSection />
      <AICameraView />
      <AIFeaturesGrid />
    </MainTabLayout>
  );
}

