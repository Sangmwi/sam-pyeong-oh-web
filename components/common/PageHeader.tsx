'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  /**  페이지 제목 */
  title: string;

  /** 우측에 표시할 액션 버튼 (선택) */
  action?: React.ReactNode;

  /** 뒤로가기 버튼 표시 여부 (기본: true) */
  showBackButton?: boolean;

  /** 커스텀 뒤로가기 핸들러 */
  onBack?: () => void;

  /** 배경색 투명 여부 (기본: false) */
  transparent?: boolean;
}

/**
 * 페이지 상단 헤더 컴포넌트
 *
 * @example
 * <PageHeader title="프로필 수정" />
 * <PageHeader title="설정" action={<Button>저장</Button>} />
 * <PageHeader title="커스텀" onBack={() => router.push('/')} />
 */
export default function PageHeader({
  title,
  action,
  showBackButton = true,
  onBack,
  transparent = false,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 ${
        transparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur-sm border-b border-border shadow-sm'
      }`}
    >
      {/* 왼쪽: 뒤로가기 버튼 */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95 transition-all"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        )}

        <h1 className="text-lg font-bold text-foreground">{title}</h1>
      </div>

      {/* 우측: 액션 버튼 */}
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  );
}
