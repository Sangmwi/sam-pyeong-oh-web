'use client';

import { Settings, Cigarette, LogOut } from 'lucide-react';
import { User } from '@/lib/types';

interface SettingsSectionProps {
  user: User;
  onEdit: () => void;
  onLogout: () => void;
}

export default function SettingsSection({ user, onEdit, onLogout }: SettingsSectionProps) {
  return (
    <section className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
      <div className="mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-card-foreground">기타 설정</h3>
      </div>

      <div className="space-y-1">
        {user.isSmoker !== undefined && (
          <div className="flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Cigarette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">흡연 여부</span>
            </div>
            <span className="text-sm font-medium text-card-foreground">
              {user.isSmoker ? '흡연' : '비흡연'}
            </span>
          </div>
        )}

        <button
          onClick={onEdit}
          className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-primary/5"
        >
          <span className="text-sm text-foreground">내 정보 수정</span>
          <span className="text-muted-foreground">&gt;</span>
        </button>

        <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-primary/5">
          <span className="text-sm text-foreground">운동 기록</span>
          <span className="text-muted-foreground">&gt;</span>
        </button>

        <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-primary/5">
          <span className="text-sm text-foreground">설정</span>
          <span className="text-muted-foreground">&gt;</span>
        </button>
      </div>

      {/* Logout Button */}
      <div className="mt-8 flex justify-center border-t border-border pt-6">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
        >
          <LogOut className="h-3 w-3" />
          로그아웃
        </button>
      </div>
    </section>
  );
}
