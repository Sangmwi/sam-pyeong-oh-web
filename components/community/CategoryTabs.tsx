'use client';

import { useState } from 'react';

interface Category {
  id: string;
  label: string;
}

const CATEGORIES: Category[] = [
  { id: 'all', label: '전체' },
  { id: 'workout', label: '운동 인증' },
  { id: 'question', label: '질문' },
  { id: 'routine', label: '루틴 공유' },
  { id: 'nutrition', label: '식단' },
];

interface CategoryTabsProps {
  onCategoryChange?: (categoryId: string) => void;
}

/**
 * 커뮤니티 카테고리 탭
 */
export default function CategoryTabs({ onCategoryChange }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const handleClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => handleClick(category.id)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
              : 'bg-card text-muted-foreground hover:bg-primary/5 border border-border/50'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
