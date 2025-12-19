import AIHeroSection from '@/components/ai/AIHeroSection';
import AICameraView from '@/components/ai/AICameraView';
import AIFeaturesGrid from '@/components/ai/AIFeaturesGrid';

export default function AIPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <AIHeroSection />
        <AICameraView />
        <AIFeaturesGrid />
      </div>
    </div>
  );
}

