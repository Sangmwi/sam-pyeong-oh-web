'use client';

import { MessageSquarePlus, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CommunityHeaderProps {
  onNewPost?: () => void;
  onFilter?: () => void;
}

/**
 * 커뮤니티 페이지 헤더
 */
export default function CommunityHeader({ onNewPost, onFilter }: CommunityHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">커뮤니티</h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="primary" size="sm" onClick={onNewPost}>
          <MessageSquarePlus className="h-4 w-4" />
          글쓰기
        </Button>
      </div>
    </div>
  );
}
