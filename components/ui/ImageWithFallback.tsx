'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src' | 'alt'> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  showFallbackIcon?: boolean;
  /** 폴백 UI의 배경 클래스. 기본값은 카드보다 약간 어두운 bg-muted/50 */
  fallbackClassName?: string;
}

/**
 * 이미지 로드 실패 시 폴백을 표시하는 Image 컴포넌트
 *
 * @example
 * ```tsx
 * // fill 모드 (부모 요소 크기에 맞춤)
 * <div className="relative w-full h-32">
 *   <ImageWithFallback
 *     src={product.image}
 *     alt="상품 이미지"
 *     fill
 *     className="object-cover"
 *   />
 * </div>
 *
 * // 고정 크기 모드
 * <ImageWithFallback
 *   src={user.avatar}
 *   alt="프로필 이미지"
 *   width={80}
 *   height={80}
 *   className="rounded-full"
 * />
 * ```
 */
export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  showFallbackIcon = true,
  fallbackClassName = 'bg-muted/80 border border-border/30',
  className,
  fill,
  sizes,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // src가 없거나 에러 발생 시
  if (!src || error) {
    // fallbackSrc가 있으면 사용
    if (fallbackSrc && !error) {
      return (
        <Image
          {...props}
          src={fallbackSrc}
          alt={alt}
          fill={fill}
          sizes={sizes}
          className={className}
          onError={() => setError(true)}
        />
      );
    }

    // 폴백 UI 표시
    if (fill) {
      // fill 모드일 때는 absolute positioning 사용
      return (
        <div className={`absolute inset-0 flex items-center justify-center ${fallbackClassName} ${className}`}>
          {showFallbackIcon && (
            <ImageOff className="h-1/3 w-1/3 text-muted-foreground/50" />
          )}
        </div>
      );
    }

    // 고정 크기 모드
    return (
      <div
        className={`flex items-center justify-center ${fallbackClassName} ${className}`}
        style={{
          width: props.width,
          height: props.height,
        }}
      >
        {showFallbackIcon && (
          <ImageOff className="h-1/3 w-1/3 text-muted-foreground/50" />
        )}
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={`${className} ${loading ? 'bg-muted animate-pulse' : ''}`}
      onLoad={() => setLoading(false)}
      onError={() => setError(true)}
    />
  );
}
