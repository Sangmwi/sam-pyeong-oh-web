import { Loader2 } from 'lucide-react';

export default function ProfileEditLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">편집 화면 준비 중...</p>
      </div>
    </div>
  );
}
