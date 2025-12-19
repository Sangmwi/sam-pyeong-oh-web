import { Skeleton } from '@/components/ui/Skeleton';

/**
 * HealthScoreCard 전용 Skeleton
 */
export default function HealthScoreCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton height="14px" width="100px" className="mb-2 bg-white/30" noAnimation />
          <Skeleton height="48px" width="80px" className="mb-1 bg-white/40" />
          <Skeleton height="12px" width="60px" className="bg-white/30" noAnimation />
        </div>
        <Skeleton circle width="80px" height="80px" className="bg-white/30" />
      </div>
    </div>
  );
}
