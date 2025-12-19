import { Loader2 } from 'lucide-react';

export default function UserProfileLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">사용자 정보 불러오는 중...</p>
      </div>
    </div>
  );
}
