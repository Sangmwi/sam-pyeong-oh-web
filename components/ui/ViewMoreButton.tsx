'use client';

import { ChevronRight } from 'lucide-react';

interface ViewMoreButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * "더 알아보기" 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <ViewMoreButton onClick={() => console.log('clicked')} />
 * <ViewMoreButton>자세히 보기</ViewMoreButton>
 * ```
 */
export default function ViewMoreButton({
  onClick,
  children = "더 알아보기",
  className = ""
}: ViewMoreButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 ${className}`}
    >
      {children} <ChevronRight className="w-4 h-4" />
    </button>
  );
}
