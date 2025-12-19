'use client';

import { useRef, useState, useEffect, ReactNode, ReactElement } from 'react';

interface HorizontalSliderProps {
  children: ReactNode;
  /** 슬라이더 아이템 사이 간격 (Tailwind gap 클래스, 예: 'gap-4') */
  gap?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 드래그 활성화 여부 */
  enableDrag?: boolean;
  /** 스크롤 속도 배율 (기본: 2) */
  scrollSpeed?: number;
}

interface HorizontalSliderItemProps {
  children: ReactNode;
  className?: string;
}

interface HorizontalSliderMoreProps {
  children: ReactNode;
  className?: string;
}

/**
 * 가로 스크롤 슬라이더 컴포넌트
 *
 * 마우스 드래그와 터치 스크롤을 지원하며,
 * 카드 클릭과 드래그를 자동으로 구분합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <HorizontalSlider gap="gap-4">
 *   {items.map(item => (
 *     <HorizontalSlider.Item key={item.id}>
 *       <Card {...item} />
 *     </HorizontalSlider.Item>
 *   ))}
 * </HorizontalSlider>
 *
 * // 더보기 버튼 포함
 * <HorizontalSlider gap="gap-4">
 *   {items.map(item => (
 *     <HorizontalSlider.Item key={item.id}>
 *       <Card {...item} />
 *     </HorizontalSlider.Item>
 *   ))}
 *   <HorizontalSlider.More>
 *     <button onClick={onMore}>더보기</button>
 *   </HorizontalSlider.More>
 * </HorizontalSlider>
 * ```
 */
function HorizontalSlider({
  children,
  gap = 'gap-4',
  className = '',
  enableDrag = true,
  scrollSpeed = 2,
}: HorizontalSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enableDrag || !scrollContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    e.preventDefault();
  };

  // 마우스 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * scrollSpeed;

    // 5px 이상 움직이면 드래그로 간주
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }

    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // 마우스 드래그 종료
  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // 터치 드래그 지원
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableDrag || !scrollContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * scrollSpeed;

    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }

    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 마우스 커서 변경
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !enableDrag) return;

    container.style.cursor = isDragging ? 'grabbing' : 'grab';
  }, [isDragging, enableDrag]);

  // 클릭 이벤트 필터링 (드래그 중에는 클릭 무시)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
        setHasDragged(false);
      }
    };

    // 캡처 단계에서 클릭 이벤트 가로채기
    container.addEventListener('click', handleClick, true);

    return () => {
      container.removeEventListener('click', handleClick, true);
    };
  }, [hasDragged]);

  // 스크롤 진행도 계산 및 인디케이터 표시
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollWidth = container.scrollWidth - container.clientWidth;
      const currentScroll = container.scrollLeft;
      const progress = scrollWidth > 0 ? (currentScroll / scrollWidth) * 100 : 0;

      setScrollProgress(progress);
      setShowIndicator(true);

      // 기존 타이머 취소
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      // 1.5초 후 인디케이터 숨김
      hideTimeoutRef.current = setTimeout(() => {
        setShowIndicator(false);
      }, 1500);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div
        ref={scrollContainerRef}
        className={`flex ${gap} overflow-x-auto scrollbar-hide pb-2 ${enableDrag ? 'select-none' : ''} ${className}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch', // iOS 부드러운 스크롤
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* 스크롤 인디케이터 */}
      <div className={`mt-2 h-0.5 w-full bg-muted rounded-full overflow-hidden transition-opacity duration-300 ${showIndicator ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className="h-full bg-primary/30 rounded-full transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * 슬라이더 아이템 래퍼
 * flex-shrink-0을 자동으로 적용하여 아이템이 줄어들지 않도록 함
 */
function HorizontalSliderItem({ children, className = '' }: HorizontalSliderItemProps) {
  return <div className={`flex-shrink-0 ${className}`}>{children}</div>;
}

/**
 * 더보기 버튼 래퍼
 * 슬라이더 끝에 더보기 버튼을 추가할 때 사용
 */
function HorizontalSliderMore({ children, className = '' }: HorizontalSliderMoreProps) {
  return (
    <div className={`flex-shrink-0 flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

// Compound Component 패턴
HorizontalSlider.Item = HorizontalSliderItem;
HorizontalSlider.More = HorizontalSliderMore;

export default HorizontalSlider;
