/**
 * 인증이 필요한 API 호출을 위한 Fetch 래퍼
 *
 * 401 에러 발생 시:
 * 1. Supabase 세션 갱신 시도
 * 2. 갱신 성공하면 원래 요청 재시도
 * 3. 갱신 실패하면 로그아웃 처리
 */

import { createClient } from '@/utils/supabase/client';

interface AuthFetchOptions extends RequestInit {
  /** 401 에러 시 세션 갱신 후 재시도 여부 (기본: true) */
  refreshOnUnauthorized?: boolean;
  /** 최대 재시도 횟수 (기본: 1) */
  maxRetries?: number;
}

/**
 * 세션 갱신 시도
 * @returns 갱신 성공 여부
 */
async function tryRefreshSession(): Promise<boolean> {
  const supabase = createClient();

  console.log('[authFetch] Attempting session refresh...');

  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('[authFetch] Session refresh failed:', error.message);
      return false;
    }

    if (!data.session) {
      console.error('[authFetch] No session after refresh');
      return false;
    }

    console.log('[authFetch] Session refreshed successfully, expires:', data.session.expires_at);
    return true;
  } catch (e) {
    console.error('[authFetch] Session refresh error:', e);
    return false;
  }
}

/**
 * 로그아웃 처리 (세션 갱신 실패 시)
 */
async function handleLogout(): Promise<void> {
  const supabase = createClient();

  console.log('[authFetch] Logging out due to session refresh failure');

  try {
    await supabase.auth.signOut({ scope: 'local' });

    // WebView 앱에 로그아웃 알림
    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOGOUT' }));
    }

    // 로그인 페이지로 이동
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (e) {
    console.error('[authFetch] Logout error:', e);
  }
}

/**
 * 인증이 필요한 API 호출용 fetch 래퍼
 *
 * 401 에러 발생 시 자동으로 세션 갱신 후 재시도
 *
 * @example
 * ```ts
 * // 기본 사용법 (401 시 자동 세션 갱신)
 * const response = await authFetch('/api/user/me');
 *
 * // 옵션 설정
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

  // credentials: 'include' 기본 설정 (WebView 쿠키 전달용)
  const mergedOptions: RequestInit = {
    credentials: 'include',
    ...fetchOptions,
  };

  let lastResponse: Response | null = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    const response = await fetch(url, mergedOptions);
    lastResponse = response;

    // 401 에러가 아니면 바로 반환
    if (response.status !== 401) {
      return response;
    }

    // 401 에러 && 세션 갱신 비활성화
    if (!refreshOnUnauthorized) {
      console.log('[authFetch] 401 received, refreshOnUnauthorized=false, returning as-is');
      return response;
    }

    // 401 에러 && 재시도 횟수 초과
    if (retryCount >= maxRetries) {
      console.log('[authFetch] 401 received, max retries exceeded');
      break;
    }

    console.log(`[authFetch] 401 received for ${url}, attempting refresh (retry ${retryCount + 1}/${maxRetries})`);

    // 세션 갱신 시도
    const refreshed = await tryRefreshSession();

    if (!refreshed) {
      console.log('[authFetch] Session refresh failed, triggering logout');
      await handleLogout();
      return response;
    }

    // 갱신 성공 - 재시도
    retryCount++;
  }

  // 모든 재시도 실패 시 로그아웃
  if (lastResponse?.status === 401) {
    await handleLogout();
  }

  return lastResponse!;
}

/**
 * JSON 응답을 처리하는 authFetch 헬퍼
 *
 * @example
 * ```ts
 * const user = await authFetchJson<User>('/api/user/me');
 * ```
 */
export async function authFetchJson<T>(
  url: string,
  options: AuthFetchOptions = {}
): Promise<T> {
  const response = await authFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}
