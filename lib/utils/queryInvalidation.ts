/**
 * Query Cache Invalidation Utilities
 *
 * React Query 캐시 무효화 전략을 체계적으로 관리
 *
 * 무효화 전략:
 * 1. 명시적 무효화: 특정 액션 후 관련 쿼리 무효화
 * 2. 배경 리패치: staleTime 경과 후 자동 리패치
 * 3. 관련 쿼리 연쇄 무효화: 연관된 쿼리 함께 무효화
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/queryKeys';

// ============================================================================
// Types
// ============================================================================

/**
 * 무효화 옵션
 */
interface InvalidateOptions {
  /** 즉시 리패치 여부 (기본: false) */
  refetch?: boolean;
  /** 정확히 일치하는 키만 무효화 (기본: false - prefix 매칭) */
  exact?: boolean;
}

// ============================================================================
// User/Profile Invalidation
// ============================================================================

/**
 * 현재 사용자 프로필 무효화
 *
 * 사용 시점:
 * - 프로필 업데이트 후
 * - 로그인/로그아웃 후
 */
export function invalidateCurrentUser(
  queryClient: QueryClient,
  options: InvalidateOptions = {}
) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.user.me(),
    exact: options.exact ?? true,
    refetchType: options.refetch ? 'active' : 'none',
  });
}

/**
 * 특정 사용자 프로필 무효화
 */
export function invalidateUserProfile(
  queryClient: QueryClient,
  userId: string,
  options: InvalidateOptions = {}
) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.user.detail(userId),
    exact: options.exact ?? true,
    refetchType: options.refetch ? 'active' : 'none',
  });
}

/**
 * 모든 사용자 관련 쿼리 무효화
 *
 * 사용 시점:
 * - 로그아웃 시
 * - 대규모 데이터 변경 시
 */
export function invalidateAllUserQueries(
  queryClient: QueryClient,
  options: InvalidateOptions = {}
) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.user.all,
    refetchType: options.refetch ? 'active' : 'none',
  });
}

/**
 * 프로필 검색/추천 결과 무효화
 *
 * 사용 시점:
 * - 사용자 프로필 변경으로 검색 결과가 달라질 때
 */
export function invalidateProfileSearch(
  queryClient: QueryClient,
  options: InvalidateOptions = {}
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.user.all, 'search'],
      refetchType: options.refetch ? 'active' : 'none',
    }),
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.user.all, 'recommendations'],
      refetchType: options.refetch ? 'active' : 'none',
    }),
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.user.all, 'same-unit'],
      refetchType: options.refetch ? 'active' : 'none',
    }),
  ]);
}

// ============================================================================
// Product Invalidation
// ============================================================================

/**
 * 상품 목록 무효화
 */
export function invalidateProductList(
  queryClient: QueryClient,
  options: InvalidateOptions = {}
) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.product.lists(),
    refetchType: options.refetch ? 'active' : 'none',
  });
}

/**
 * 특정 상품 상세 무효화
 */
export function invalidateProductDetail(
  queryClient: QueryClient,
  productId: string,
  options: InvalidateOptions = {}
) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.product.detail(productId),
    exact: options.exact ?? true,
    refetchType: options.refetch ? 'active' : 'none',
  });
}

// ============================================================================
// Post Invalidation
// ============================================================================

/**
 * 게시글 목록 무효화
 */
export function invalidatePostList(
  queryClient: QueryClient,
  options: InvalidateOptions = {}
) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.post.lists(),
    refetchType: options.refetch ? 'active' : 'none',
  });
}

/**
 * 특정 게시글 상세 무효화
 */
export function invalidatePostDetail(
  queryClient: QueryClient,
  postId: string,
  options: InvalidateOptions = {}
) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.post.detail(postId),
    exact: options.exact ?? true,
    refetchType: options.refetch ? 'active' : 'none',
  });
}

// ============================================================================
// Composite Invalidation (연쇄 무효화)
// ============================================================================

/**
 * 프로필 업데이트 후 연쇄 무효화
 *
 * 현재 사용자 + 검색/추천 결과 함께 무효화
 */
export async function invalidateAfterProfileUpdate(
  queryClient: QueryClient
) {
  await Promise.all([
    invalidateCurrentUser(queryClient, { refetch: true }),
    invalidateProfileSearch(queryClient),
  ]);
}

/**
 * 로그아웃 후 전체 캐시 정리
 */
export function clearCacheOnLogout(queryClient: QueryClient) {
  // 모든 쿼리 캐시 제거
  queryClient.clear();
}

/**
 * 로그인 후 초기 데이터 프리패치
 */
export async function prefetchOnLogin(queryClient: QueryClient) {
  // 현재 사용자 정보 즉시 로드
  await queryClient.prefetchQuery({
    queryKey: queryKeys.user.me(),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// ============================================================================
// Hook for Mutation Callbacks
// ============================================================================

/**
 * Mutation 성공 시 캐시 무효화 콜백 생성
 *
 * @example
 * useMutation({
 *   mutationFn: updateProfile,
 *   ...createInvalidationCallbacks(queryClient, {
 *     onSuccess: invalidateAfterProfileUpdate,
 *   }),
 * });
 */
export function createInvalidationCallbacks(
  queryClient: QueryClient,
  handlers: {
    onSuccess?: (queryClient: QueryClient) => void | Promise<void>;
    onError?: (queryClient: QueryClient, error: unknown) => void;
  }
) {
  return {
    onSuccess: async () => {
      if (handlers.onSuccess) {
        await handlers.onSuccess(queryClient);
      }
    },
    onError: (error: unknown) => {
      if (handlers.onError) {
        handlers.onError(queryClient, error);
      }
    },
  };
}
