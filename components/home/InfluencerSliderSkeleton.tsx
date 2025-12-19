import { Skeleton } from '@/components/ui/Skeleton';

/**
 * InfluencerSlider 전용 Skeleton
 */
export default function InfluencerSliderSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="min-w-[280px] rounded-2xl bg-card p-5 shadow-sm border border-border/50">
          <Skeleton height="120px" className="mb-3 rounded-xl" />
          <Skeleton height="18px" width="70%" className="mb-2" />
          <Skeleton height="14px" width="40%" />
        </div>
      ))}
    </div>
  );
}
