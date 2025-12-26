/**
 * App Store (Zustand)
 *
 * 앱 전역 상태 관리
 * - WebView 환경 감지
 * - 네트워크 상태
 * - 앱 초기화 상태
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

interface AppState {
  // WebView 환경
  isInWebView: boolean;
  isWebViewReady: boolean;

  // 네트워크 상태
  isOnline: boolean;

  // 앱 상태
  isInitialized: boolean;
  isHydrated: boolean;
}

interface AppActions {
  // WebView
  setIsInWebView: (isInWebView: boolean) => void;
  setIsWebViewReady: (isReady: boolean) => void;

  // 네트워크
  setIsOnline: (isOnline: boolean) => void;

  // 앱
  setIsInitialized: (isInitialized: boolean) => void;
  setIsHydrated: (isHydrated: boolean) => void;

  // 리셋
  reset: () => void;
}

type AppStore = AppState & AppActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: AppState = {
  isInWebView: false,
  isWebViewReady: false,
  isOnline: true,
  isInitialized: false,
  isHydrated: false,
};

// ============================================================================
// Store
// ============================================================================

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setIsInWebView: (isInWebView) =>
        set({ isInWebView }, false, 'setIsInWebView'),

      setIsWebViewReady: (isWebViewReady) =>
        set({ isWebViewReady }, false, 'setIsWebViewReady'),

      setIsOnline: (isOnline) =>
        set({ isOnline }, false, 'setIsOnline'),

      setIsInitialized: (isInitialized) =>
        set({ isInitialized }, false, 'setIsInitialized'),

      setIsHydrated: (isHydrated) =>
        set({ isHydrated }, false, 'setIsHydrated'),

      reset: () =>
        set(initialState, false, 'reset'),
    }),
    { name: 'AppStore' }
  )
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

export const selectIsInWebView = (state: AppStore) => state.isInWebView;
export const selectIsWebViewReady = (state: AppStore) => state.isWebViewReady;
export const selectIsOnline = (state: AppStore) => state.isOnline;
export const selectIsInitialized = (state: AppStore) => state.isInitialized;
