/**
 * 이미지 압축 유틸리티
 *
 * 모바일/웹뷰 환경에서 업로드 성능을 향상시키기 위해
 * 클라이언트 측에서 이미지를 압축합니다.
 *
 * 주요 개선사항:
 * - createObjectURL 사용으로 메모리 최적화 (DataURL 대비 50% 절감)
 * - HEIC/HEIF 포맷 명시적 처리
 * - 압축 결과 상태 반환으로 에러 처리 강화
 */

// ============================================================
// Types
// ============================================================

export interface ImageCompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

export interface CompressionResult {
  success: boolean;
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
  warning?: string;
}

// ============================================================
// Constants
// ============================================================

const MAX_COMPRESSION_RETRIES = 3;
const MIN_QUALITY = 0.5;
const QUALITY_DECREMENT = 0.15;

/** 서버 업로드 제한 (압축 실패 시 원본 크기 체크용) */
const SERVER_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/** 지원하지 않는 이미지 포맷 */
const UNSUPPORTED_FORMATS = ['image/heic', 'image/heif'];

/** HEIC 파일 확장자 패턴 */
const HEIC_EXTENSIONS = ['.heic', '.heif'];

// ============================================================
// Helpers
// ============================================================

/**
 * 파일이 HEIC/HEIF 포맷인지 확인
 */
function isHeicFormat(file: File): boolean {
  // MIME 타입 체크
  if (UNSUPPORTED_FORMATS.includes(file.type.toLowerCase())) {
    return true;
  }

  // 확장자 체크 (MIME 타입이 비어있거나 잘못된 경우 대비)
  const fileName = file.name.toLowerCase();
  return HEIC_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

/**
 * 파일이 이미지인지 확인
 */
export function isImageFile(file: File): boolean {
  // MIME 타입으로 1차 체크
  if (file.type.startsWith('image/')) {
    return true;
  }

  // 확장자로 2차 체크 (웹뷰에서 MIME 타입이 비어있을 수 있음)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic', '.heif'];
  const fileName = file.name.toLowerCase();
  return imageExtensions.some((ext) => fileName.endsWith(ext));
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Canvas에 이미지를 그리고 Blob으로 변환 (내부 헬퍼)
 */
function compressToBlob(
  img: HTMLImageElement,
  maxWidthOrHeight: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다. 브라우저가 지원하지 않습니다.'));
        return;
      }

      // 리사이징 비율 계산
      let { width, height } = img;

      if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
        if (width > height) {
          height = Math.round((height / width) * maxWidthOrHeight);
          width = maxWidthOrHeight;
        } else {
          width = Math.round((width / height) * maxWidthOrHeight);
          height = maxWidthOrHeight;
        }
      }

      // Canvas 크기 설정
      canvas.width = width;
      canvas.height = height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지를 압축할 수 없습니다.'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * ObjectURL을 사용하여 이미지 로드 (메모리 효율적)
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl); // 메모리 해제
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 로드할 수 없습니다. 지원하지 않는 파일 형식일 수 있습니다.'));
    };

    img.src = objectUrl;
  });
}

// ============================================================
// Main Functions
// ============================================================

/**
 * 이미지 파일을 압축합니다.
 *
 * @param file - 압축할 이미지 파일
 * @param options - 압축 옵션
 * @returns 압축 결과 (성공/실패 상태 포함)
 *
 * @example
 * ```ts
 * const result = await compressImage(file, { maxSizeMB: 1 });
 * if (!result.success) {
 *   alert(result.error);
 *   return;
 * }
 * // result.file 사용
 * ```
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    quality: initialQuality = 0.8,
  } = options;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const originalSize = file.size;

  // 결과 객체 초기화
  const createResult = (
    success: boolean,
    resultFile: File,
    error?: string,
    warning?: string
  ): CompressionResult => ({
    success,
    file: resultFile,
    originalSize,
    compressedSize: resultFile.size,
    compressionRatio: Math.round((1 - resultFile.size / originalSize) * 100),
    error,
    warning,
  });

  // 1. HEIC/HEIF 포맷 체크
  if (isHeicFormat(file)) {
    return createResult(
      false,
      file,
      'HEIC/HEIF 형식은 지원하지 않습니다. iPhone에서 설정 > 카메라 > 포맷에서 "높은 호환성"을 선택하거나, JPG/PNG로 변환 후 업로드해주세요.'
    );
  }

  // 2. Canvas API 지원 확인
  if (typeof document === 'undefined' || !document.createElement) {
    // SSR 환경 - 원본 반환 (서버 크기 제한 체크)
    if (originalSize > SERVER_MAX_SIZE_BYTES) {
      return createResult(
        false,
        file,
        `파일 크기가 ${formatFileSize(SERVER_MAX_SIZE_BYTES)}를 초과합니다. 더 작은 이미지를 선택해주세요.`
      );
    }
    return createResult(true, file, undefined, '브라우저에서 이미지 압축을 지원하지 않아 원본을 사용합니다.');
  }

  try {
    // 3. 이미지 로드 (ObjectURL 사용 - 메모리 효율적)
    const img = await loadImageFromFile(file);

    // 4. 압축 시도 (품질을 낮추면서 목표 크기 달성)
    let quality = initialQuality;
    let blob: Blob | null = null;
    let retries = 0;

    while (retries < MAX_COMPRESSION_RETRIES) {
      blob = await compressToBlob(img, maxWidthOrHeight, quality);

      if (blob.size <= maxSizeBytes || quality <= MIN_QUALITY) {
        break;
      }

      quality -= QUALITY_DECREMENT;
      retries++;
    }

    if (!blob) {
      // 압축 완전 실패 - 원본 크기 체크
      if (originalSize > SERVER_MAX_SIZE_BYTES) {
        return createResult(
          false,
          file,
          `이미지 압축에 실패했고, 원본 크기(${formatFileSize(originalSize)})가 업로드 제한(${formatFileSize(SERVER_MAX_SIZE_BYTES)})을 초과합니다.`
        );
      }
      return createResult(true, file, undefined, '이미지 압축에 실패하여 원본을 사용합니다.');
    }

    // 5. File 객체로 변환 (JPEG로 압축했으므로 확장자도 .jpg로 변경)
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    const compressedFile = new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    // 6. 압축 후에도 너무 크면 경고
    let warning: string | undefined;
    if (compressedFile.size > maxSizeBytes) {
      if (compressedFile.size > SERVER_MAX_SIZE_BYTES) {
        return createResult(
          false,
          compressedFile,
          `압축 후에도 파일 크기(${formatFileSize(compressedFile.size)})가 업로드 제한(${formatFileSize(SERVER_MAX_SIZE_BYTES)})을 초과합니다.`
        );
      }
      warning = `압축 후에도 파일이 ${formatFileSize(compressedFile.size)}입니다.`;
    }

    return createResult(true, compressedFile, undefined, warning);
  } catch (error) {
    // 압축 과정에서 에러 발생
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    // 원본으로 폴백 시도
    if (originalSize <= SERVER_MAX_SIZE_BYTES) {
      return createResult(
        true,
        file,
        undefined,
        `이미지 압축 중 오류가 발생하여 원본을 사용합니다: ${errorMessage}`
      );
    }

    return createResult(
      false,
      file,
      `이미지 처리 실패: ${errorMessage}. 원본 크기(${formatFileSize(originalSize)})도 업로드 제한을 초과합니다.`
    );
  }
}

/**
 * 레거시 호환용 - 단순 File 반환 버전
 * @deprecated compressImage를 사용하세요
 */
export async function compressImageLegacy(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const result = await compressImage(file, options);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.file;
}
