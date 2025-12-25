/**
 * WebView Constants
 *
 * ⚠️ SOURCE OF TRUTH
 * 이 파일 수정 시 앱의 lib/webview/types.ts에도 동일하게 반영하세요.
 */

import type { RouteInfo } from './types';

// ============================================================================
// Route Constants
// ============================================================================

export const DEFAULT_ROUTE_INFO: RouteInfo = {
  path: '/',
  isTabRoute: true,
  isHome: true,
  canGoBack: false,
};

export const LOGIN_ROUTE_INFO: RouteInfo = {
  path: '/login',
  isTabRoute: false,
  isHome: false,
  canGoBack: false,
};
