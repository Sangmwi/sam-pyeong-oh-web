import { LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
  /** 아이콘 (Lucide 아이콘 컴포넌트) */
  icon?: LucideIcon;

  /** 제목 */
  title: string;

  /** 설명 */
  description?: string;

  /** 액션 버튼 텍스트 */
  actionLabel?: string;

  /** 액션 버튼 클릭 핸들러 */
  onAction?: () => void;
}

/**
 * 데이터가 없을 때 표시하는 Empty State 컴포넌트
 *
 * @example
 * <EmptyState
 *   icon={Inbox}
 *   title="게시글이 없습니다"
 *   description="첫 게시글을 작성해보세요"
 *   actionLabel="게시글 작성"
 *   onAction={() => router.push('/post/new')}
 * />
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* 아이콘 */}
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* 제목 */}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>

      {/* 설명 */}
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

      {/* 액션 버튼 */}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
