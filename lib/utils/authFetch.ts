/**
 * 인증이 필요한 API 호출을 위한 Fetch 래퍼
 *
 * 쿠키 기반 인증을 사용합니다.
 * - 앱(WebView): /api/auth/session으로 쿠키 세션이 설정됨
 * - 웹 브라우저: Supabase SSR이 쿠키 관리
 *
 * 401 에러 발생 시:
 * - 앱 환경: 앱에 세션 갱신 요청
 * - 웹 환경: Supabase 세션 갱신 시도
 */

import { createClient } from '@/utils/supabase/client';
import { ApiError } from '@/lib/types';

// ============================================================================
// Constants
// ============================================================================

const LOG_PREFIX = '[authFetch]';

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * WebView 환경인지 확인합니다.
 */
export function isInWebView(): boolean {
  return typeof window !== 'undefined' && !!window.ReactNativeWebView;
}

// ============================================================================
// Types
// ============================================================================

interface AuthFetchOptions extends RequestInit {
  /** 401 에러 시 세션 갱신 후 재시도 여부 (기본: true) */
  refreshOnUnauthorized?: boolean;
  /** 최대 재시도 횟수 (기본: 1) */
  maxRetries?: number;
}

// ============================================================================
// Session Refresh with Mutex (Race Condition Prevention)
// ============================================================================

/**
 * 세션 갱신 상태 관리
 *
 * 동시에 여러 요청이 401을 받았을 때 한 번만 갱신하도록 함
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * 앱에 세션 갱신을 요청합니다.
 */
function requestSessionRefreshFromApp(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!window.ReactNativeWebView) {
      resolve(false);
      return;
    }

    const timeout = setTimeout(() => {
      console.log(`${LOG_PREFIX} Session refresh timeout`);
      resolve(false);
    }, 5000);

    // 세션 갱신 완료 이벤트 대기
    const handleSessionUpdate = (event: CustomEvent) => {
      if (event.detail?.type === 'SESSION_REFRESHED') {
        clearTimeout(timeout);
        window.removeEventListener('app-command', handleSessionUpdate as EventListener);
        console.log(`${LOG_PREFIX} Session refreshed from app`);
        resolve(event.detail.success ?? true);
      }
    };

    window.addEventListener('app-command', handleSessionUpdate as EventListener);

    // 앱에 갱신 요청
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'REQUEST_SESSION_REFRESH' })
    );

    console.log(`${LOG_PREFIX} Requested session refresh from app`);
  });
}

/**
 * 쿠키 기반 세션 갱신 시도 (웹 브라우저 환경)
 */
async function refreshCookieSession(): Promise<boolean> {
  const supabase = createClient();

  console.log(`${LOG_PREFIX} Refreshing cookie session...`);

  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      console.error(`${LOG_PREFIX} Session refresh failed:`, error?.message);
      return false;
    }

    console.log(`${LOG_PREFIX} Session refreshed, expires:`, data.session.expires_at);
    return true;
  } catch (e) {
    console.error(`${LOG_PREFIX} Session refresh error:`, e);
    return false;
  }
}

/**
 * 실제 세션 갱신 수행 (내부용)
 */
async function performSessionRefresh(): Promise<boolean> {
  if (isInWebView()) {
    return requestSessionRefreshFromApp();
  }
  return refreshCookieSession();
}

/**
 * 환경에 맞는 세션 갱신을 시도합니다.
 *
 * Mutex 패턴으로 동시 갱신 요청 방지:
 * - 첫 번째 요청만 실제 갱신 수행
 * - 이후 요청들은 첫 번째 요청의 결과를 공유
 */
async function tryRefreshSession(): Promise<boolean> {
  // 이미 갱신 중이면 기존 Promise 반환
  if (refreshPromise) {
    console.log(`${LOG_PREFIX} Waiting for existing refresh...`);
    return refreshPromise;
  }

  // 새 갱신 시작
  console.log(`${LOG_PREFIX} Starting new session refresh...`);
  refreshPromise = performSessionRefresh().finally(() => {
    // 갱신 완료 후 Promise 초기화 (다음 갱신 허용)
    refreshPromise = null;
  });

  return refreshPromise;
}

// ============================================================================
// Logout Handler
// ============================================================================

/**
 * 로그아웃 처리 (세션 갱신 실패 시)
 */
async function handleLogout(): Promise<void> {
  console.log(`${LOG_PREFIX} Session expired, logging out...`);

  try {
    // 서버 세션 삭제
    await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' });
  } catch (e) {
    console.error(`${LOG_PREFIX} Logout API error:`, e);
  }

  // 앱에 로그아웃 알림
  if (isInWebView()) {
    window.ReactNativeWebView!.postMessage(JSON.stringify({ type: 'SESSION_EXPIRED' }));
  }

  // 로그인 페이지로 이동
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// ============================================================================
// Main Fetch Function
// ============================================================================

/**
 * 인증이 필요한 API 호출용 fetch 래퍼
 *
 * 쿠키 기반 인증을 사용하므로 별도의 토큰 관리가 필요 없습니다.
 * 401 에러 시 자동으로 세션 갱신 후 재시도합니다.
 *
 * @example
 * ```ts
 * const response = await authFetch('/api/user/me');
 *
 * const response = await authFetch('/api/user/profile', {
 *   method: 'PATCH',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(data),
 * });
 * ```
 */
export async function authFetch(
  url: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const {
    refreshOnUnauthorized = true,
    maxRetries = 1,
    ...fetchOptions
  } = options;

  const mergedOptions: RequestInit = {
    credentials: 'include', // 쿠키 자동 포함
    ...fetchOptions,
  };

  let lastResponse: Response | null = null;
  let retryCount = 0;

  console.log(`${LOG_PREFIX} 📤 ${fetchOptions.method || 'GET'} ${url}`);

  while (retryCount <= maxRetries) {
    try {
      const response = await fetch(url, mergedOptions);
      lastResponse = response;

      console.log(`${LOG_PREFIX} 📥 ${response.status} ${url}`);

      // 성공 또는 401 외의 에러
      if (response.status !== 401) {
        return response;
      }

      // 401 && 세션 갱신 비활성화
      if (!refreshOnUnauthorized) {
        console.log(`${LOG_PREFIX} 401, refresh disabled`);
        return response;
      }

      // 401 && 재시도 횟수 초과
      if (retryCount >= maxRetries) {
        console.log(`${LOG_PREFIX} 401, max retries exceeded`);
        break;
      }

      console.log(`${LOG_PREFIX} 401, attempting refresh (${retryCount + 1}/${maxRetries})`);

      const refreshed = await tryRefreshSession();

      if (!refreshed) {
        console.log(`${LOG_PREFIX} Refresh failed, logging out`);
        await handleLogout();
        return response;
      }

      retryCount++;
    } catch (networkError) {
      console.error(`${LOG_PREFIX} 🔴 Network error:`, networkError);
      throw networkError;
    }
  }

  // 모든 재시도 실패 시 로그아웃
  if (lastResponse?.status === 401) {
    await handleLogout();
  }

  return lastResponse!;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * JSON 응답을 처리하는 authFetch 헬퍼
 *
 * @throws {ApiError} 요청 실패 시 ApiError 발생
 */
export async function authFetchJson<T>(
  url: string,
  options: AuthFetchOptions = {}
): Promise<T> {
  let response: Response;

  try {
    response = await authFetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  } catch (error) {
    throw ApiError.fromNetworkError(error);
  }

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  return response.json();
}
