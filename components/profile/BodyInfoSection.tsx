'use client';

import { Activity, Eye, EyeOff } from 'lucide-react';
import { User } from '@/lib/types';

interface BodyInfoSectionProps {
  user: User;
  onEdit: () => void;
}

export default function BodyInfoSection({ user, onEdit }: BodyInfoSectionProps) {
  const hasBodyInfo = user.height || user.weight || user.muscleMass || user.bodyFatPercentage;

  return (
    <section className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-card-foreground">신체 정보</h3>
        </div>
        {user.showInbodyPublic !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {user.showInbodyPublic ? (
              <>
                <Eye className="h-4 w-4" />
                <span>공개</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                <span>비공개</span>
              </>
            )}
          </div>
        )}
      </div>

      {hasBodyInfo ? (
        <div className="space-y-3">
          {(user.height || user.weight) && (
            <div className="flex items-center gap-4">
              {user.height && (
                <div className="flex-1 rounded-xl bg-primary/5 p-3 text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground">키</p>
                  <p className="text-lg font-bold text-card-foreground">{user.height}cm</p>
                </div>
              )}
              {user.weight && (
                <div className="flex-1 rounded-xl bg-primary/5 p-3 text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground">몸무게</p>
                  <p className="text-lg font-bold text-card-foreground">{user.weight}kg</p>
                </div>
              )}
            </div>
          )}

          {(user.muscleMass || user.bodyFatPercentage) && (
            <div className="flex items-center gap-4">
              {user.muscleMass && (
                <div className="flex-1 rounded-xl bg-primary/5 p-3 text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground">골격근량</p>
                  <p className="text-lg font-bold text-card-foreground">{user.muscleMass}kg</p>
                </div>
              )}
              {user.bodyFatPercentage && (
                <div className="flex-1 rounded-xl bg-primary/5 p-3 text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground">체지방률</p>
                  <p className="text-lg font-bold text-card-foreground">{user.bodyFatPercentage}%</p>
                </div>
              )}
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
          <p className="mb-4 text-sm text-muted-foreground">아직 등록된 신체 정보가 없습니다</p>
          <button
            onClick={onEdit}
            className="rounded-lg bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 border border-primary/20"
          >
            신체 정보 입력하기
          </button>
        </div>
      )}
    </section>
  );
}
