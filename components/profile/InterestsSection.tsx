'use client';

import { Heart } from 'lucide-react';
import { User } from '@/lib/types';

interface InterestsSectionProps {
  user: User;
  onEdit: () => void;
}

export default function InterestsSection({ user, onEdit }: InterestsSectionProps) {
  const hasInterests =
    (user.interestedLocations && user.interestedLocations.length > 0) ||
    (user.interestedExercises && user.interestedExercises.length > 0);

  return (
    <section className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-card-foreground">관심사</h3>
      </div>

      {hasInterests ? (
        <div className="space-y-4">
          {user.interestedLocations && user.interestedLocations.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">관심 운동 장소</p>
              <div className="flex flex-wrap gap-2">
                {user.interestedLocations.map((location, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.interestedExercises && user.interestedExercises.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">관심 운동 종목</p>
              <div className="flex flex-wrap gap-2">
                {user.interestedExercises.map((exercise, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary border border-primary/20"
                  >
                    {exercise}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onEdit}
            className="w-full rounded-lg py-2 text-sm text-primary hover:bg-primary/5"
          >
            수정하기
          </button>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="mb-4 text-sm text-muted-foreground">관심사를 추가해 보세요</p>
          <button
            onClick={onEdit}
            className="rounded-lg bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 border border-primary/20"
          >
            관심사 추가하기
          </button>
        </div>
      )}
    </section>
  );
}
