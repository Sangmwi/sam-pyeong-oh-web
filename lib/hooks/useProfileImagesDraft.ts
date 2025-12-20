'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  compressImage,
  isImageFile,
  formatFileSize,
  type CompressionResult,
} from '@/lib/utils/imageCompression';

// ============================================================
// Types
// ============================================================

export interface DraftImage {
  id: string;
  displayUrl: string;
  originalUrl?: string;
  file?: File;
  isNew: boolean;
}

export interface ImageChanges {
  newImages: { file: File; id: string }[];
  deletedUrls: string[];
  finalOrder: DraftImage[];
  hasChanges: boolean;
}

export interface AddImageResult {
  success: boolean;
  error?: string;
  warning?: string;
}

interface UseProfileImagesDraftOptions {
  maxImages?: number;
  onImagesChange?: (images: DraftImage[]) => void;
}

interface UseProfileImagesDraftReturn {
  images: DraftImage[];
  isProcessing: boolean;
  hasChanges: boolean;
  addImage: (file: File, index: number) => Promise<AddImageResult>;
  removeImage: (index: number) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  reset: () => void;
  getChanges: () => ImageChanges;
}

// ============================================================
// Constants
// ============================================================

/** 클라이언트 측 파일 크기 제한 (압축 전) */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** 기본 최대 이미지 수 */
const DEFAULT_MAX_IMAGES = 4;

/** 이미지 압축 옵션 */
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  quality: 0.8,
};

// ============================================================
// Helpers
// ============================================================

const generateId = () => `img-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createDraftFromUrl = (url: string): DraftImage => ({
  id: generateId(),
  displayUrl: url,
  originalUrl: url,
  isNew: false,
});

const createDraftFromFile = (file: File, blobUrl: string): DraftImage => ({
  id: generateId(),
  displayUrl: blobUrl,
  file,
  isNew: true,
});

// ============================================================
// Hook
// ============================================================

/**
 * 프로필 이미지 드래프트 관리 훅
 *
 * 로컬 상태만 관리하며, 저장 시 일괄 처리를 위한 데이터를 제공합니다.
 * API 호출은 하지 않습니다.
 *
 * @example
 * ```tsx
 * const { images, addImage, removeImage, getChanges } = useProfileImagesDraft(initialUrls);
 *
 * const handleAdd = async (file: File, index: number) => {
 *   const result = await addImage(file, index);
 *   if (!result.success) {
 *     alert(result.error);
 *   }
 * };
 * ```
 */
export function useProfileImagesDraft(
  initialImages: string[] = [],
  options: UseProfileImagesDraftOptions = {}
): UseProfileImagesDraftReturn {
  const { maxImages = DEFAULT_MAX_IMAGES, onImagesChange } = options;

  // ========== State ==========

  const createInitialState = useCallback(
    () => initialImages.map(createDraftFromUrl),
    [initialImages]
  );

  const [images, setImages] = useState<DraftImage[]>(createInitialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletedUrls, setDeletedUrls] = useState<string[]>([]);

  // ========== Refs ==========

  /** Blob URL 관리 (메모리 누수 방지) */
  const blobUrlsRef = useRef<Set<string>>(new Set());

  /** 초기 이미지 URL 저장 (변경 감지용) */
  const initialImagesRef = useRef<string[]>(initialImages);

  /** 최신 상태 참조 (getChanges에서 사용) */
  const imagesRef = useRef<DraftImage[]>(images);
  const deletedUrlsRef = useRef<string[]>(deletedUrls);

  // Ref 동기화
  imagesRef.current = images;
  deletedUrlsRef.current = deletedUrls;

  // ========== Effects ==========

  // 초기 이미지 변경 시 리셋
  useEffect(() => {
    const hasInitialChanged =
      JSON.stringify(initialImages) !== JSON.stringify(initialImagesRef.current);

    if (hasInitialChanged) {
      initialImagesRef.current = initialImages;
      setImages(initialImages.map(createDraftFromUrl));
      setDeletedUrls([]);
    }
  }, [initialImages]);

  // Cleanup: 언마운트 시 Blob URL 해제
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  // ========== Computed ==========

  const hasChanges = useCallback(() => {
    if (deletedUrls.length > 0) return true;
    if (images.some((img) => img.isNew)) return true;

    const currentUrls = images.map((img) => img.originalUrl).filter(Boolean);
    if (currentUrls.length !== initialImagesRef.current.length) return true;

    return currentUrls.some((url, i) => url !== initialImagesRef.current[i]);
  }, [images, deletedUrls]);

  // ========== Actions ==========

  /**
   * 이미지 추가
   * @returns 결과 객체 (성공 여부, 에러/경고 메시지)
   */
  const addImage = useCallback(
    async (file: File, index: number): Promise<AddImageResult> => {
      // 1. 기본 검증
      if (!isImageFile(file)) {
        return {
          success: false,
          error: '이미지 파일만 업로드할 수 있습니다. (JPG, PNG, WebP 등)',
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `파일 크기는 ${formatFileSize(MAX_FILE_SIZE)} 이하여야 합니다. 현재: ${formatFileSize(file.size)}`,
        };
      }

      // 2. 이미 최대 개수인지 체크
      if (images.length >= maxImages && index >= images.length) {
        return {
          success: false,
          error: `최대 ${maxImages}장까지 업로드할 수 있습니다.`,
        };
      }

      setIsProcessing(true);

      try {
        // 3. 이미지 압축
        const compressionResult: CompressionResult = await compressImage(
          file,
          COMPRESSION_OPTIONS
        );

        // 압축 실패 시 에러 반환
        if (!compressionResult.success) {
          return {
            success: false,
            error: compressionResult.error,
          };
        }

        // 4. Blob URL 생성
        const blobUrl = URL.createObjectURL(compressionResult.file);
        blobUrlsRef.current.add(blobUrl);

        const newDraft = createDraftFromFile(compressionResult.file, blobUrl);

        // 5. 상태 업데이트
        setImages((prev) => {
          const newImages = [...prev];

          // 기존 이미지가 있는 슬롯이면 교체
          if (index < newImages.length && newImages[index]) {
            const existing = newImages[index];

            // 기존 이미지 삭제 처리
            if (existing.originalUrl) {
              setDeletedUrls((urls) => [...urls, existing.originalUrl!]);
            }
            if (existing.displayUrl.startsWith('blob:')) {
              URL.revokeObjectURL(existing.displayUrl);
              blobUrlsRef.current.delete(existing.displayUrl);
            }

            newImages[index] = newDraft;
          } else {
            // 빈 슬롯이면 배열 끝에 추가
            newImages.push(newDraft);
          }

          return newImages.slice(0, maxImages);
        });

        // 6. 경고가 있으면 포함하여 반환
        return {
          success: true,
          warning: compressionResult.warning,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        return {
          success: false,
          error: `이미지 처리 실패: ${errorMessage}`,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [images.length, maxImages]
  );

  /**
   * 이미지 삭제
   */
  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (!target) return prev;

      // 기존 이미지면 삭제 목록에 추가
      if (target.originalUrl) {
        setDeletedUrls((urls) => [...urls, target.originalUrl!]);
      }

      // Blob URL 정리
      if (target.displayUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.displayUrl);
        blobUrlsRef.current.delete(target.displayUrl);
      }

      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /**
   * 이미지 순서 변경
   */
  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setImages((prev) => {
      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      return newImages;
    });
  }, []);

  /**
   * 초기 상태로 복원
   */
  const reset = useCallback(() => {
    // Blob URL 정리
    images.forEach((img) => {
      if (img.displayUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.displayUrl);
        blobUrlsRef.current.delete(img.displayUrl);
      }
    });

    setImages(initialImagesRef.current.map(createDraftFromUrl));
    setDeletedUrls([]);
  }, [images]);

  /**
   * 저장용 변경사항 반환 (항상 최신 상태를 ref에서 읽음)
   */
  const getChanges = useCallback((): ImageChanges => {
    const currentImages = imagesRef.current;
    const currentDeletedUrls = deletedUrlsRef.current;

    const newImages = currentImages
      .filter((img) => img.isNew && img.file)
      .map((img) => ({ file: img.file!, id: img.id }));

    // hasChanges 로직 인라인
    const hasAnyChanges = (() => {
      if (currentDeletedUrls.length > 0) return true;
      if (currentImages.some((img) => img.isNew)) return true;

      const currentUrls = currentImages.map((img) => img.originalUrl).filter(Boolean);
      if (currentUrls.length !== initialImagesRef.current.length) return true;

      return currentUrls.some((url, i) => url !== initialImagesRef.current[i]);
    })();

    return {
      newImages,
      deletedUrls: currentDeletedUrls,
      finalOrder: currentImages,
      hasChanges: hasAnyChanges,
    };
  }, []);

  // ========== Return ==========

  return {
    images,
    isProcessing,
    hasChanges: hasChanges(),
    addImage,
    removeImage,
    reorderImages,
    reset,
    getChanges,
  };
}
