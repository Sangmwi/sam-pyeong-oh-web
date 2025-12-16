'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

type ImageWithFallbackProps = ImageProps & {
  fallbackSrc?: string
}

/**
 * Image 컴포넌트 with 로딩 실패 시 fallback 처리
 * - 이미지 로딩 실패 시 fallback 이미지로 대체
 * - placeholder blur 효과 지원
 */
export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      onError={() => {
        if (!hasError) {
          setHasError(true)
          setImgSrc(fallbackSrc)
        }
      }}
    />
  )
}

