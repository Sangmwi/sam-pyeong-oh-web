// ============================================================================
// Route Information
// ============================================================================

export type RouteInfo = {
  path: string;
  isTabRoute: boolean;
  isHome: boolean;
  canGoBack: boolean;
};

// ============================================================================
// WebView Bridge Messages
// ============================================================================

/** 앱 → 웹 메시지 (CustomEvent로 수신) */
export type AppToWebCommand =
  | { type: 'NAVIGATE_HOME' }
  | { type: 'NAVIGATE_TO'; path: string }
  | { type: 'GET_ROUTE_INFO' }
  | { type: 'SET_SESSION'; access_token: string; refresh_token: string }
  | { type: 'CLEAR_SESSION' }
  | { type: 'LOGIN_ERROR'; error: string };

/** 웹 → 앱 메시지 (postMessage로 전송) */
export type WebToAppMessage =
  | { type: 'ROUTE_INFO'; payload: RouteInfo }
  | { type: 'LOGOUT' }
  | { type: 'REQUEST_LOGIN' }
  | { type: 'WEB_READY' }
  | { type: 'SESSION_SET'; success: boolean }
  | { type: 'REQUEST_SESSION_REFRESH' }
  | { type: 'SESSION_EXPIRED' };

// ============================================================================
// Global Type Declarations
// ============================================================================

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }

  interface WindowEventMap {
    'app-command': CustomEvent<AppToWebCommand>;
  }
}
