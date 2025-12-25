"use client";

/**
 * WebView Bridge Hook
 *
 * 앱(Expo)과 웹(Next.js) 간 통신을 관리합니다.
 *
 * 인증 흐름:
 * 1. 앱에서 SET_SESSION 명령 수신 (access_token, refresh_token)
 * 2. /api/auth/session API 호출하여 쿠키 세션 설정
 * 3. SESSION_SET 응답으로 완료 알림
 */

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isTabRoute } from "@/lib/routes";
import type { AppToWebCommand, WebToAppMessage } from "@/lib/webview";

// Re-export types for convenience
export type { AppToWebCommand, WebToAppMessage } from "@/lib/webview";

// ============================================================================
// Constants
// ============================================================================

const LOG_PREFIX = "[WebViewBridge]";

// ============================================================================
// Hook
// ============================================================================

export const useWebViewBridge = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isReadyRef = useRef(false);

  // WebView 환경 여부 확인
  const isInWebView = typeof window !== "undefined" && !!window.ReactNativeWebView;

  // ──────────────────────────────────────────────────────────────────────────
  // 웹 → 앱 메시지 전송 헬퍼
  // ──────────────────────────────────────────────────────────────────────────

  const sendMessage = (message: WebToAppMessage) => {
    if (!window.ReactNativeWebView) return false;
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
    return true;
  };

  const sendRouteInfo = () => {
    sendMessage({
      type: "ROUTE_INFO",
      payload: {
        path: pathname,
        isTabRoute: isTabRoute(pathname),
        isHome: pathname === "/",
        canGoBack: !isTabRoute(pathname),
      },
    });
  };

  const sendLogout = () => {
    sendMessage({ type: "LOGOUT" });
  };

  const requestLogin = () => {
    return sendMessage({ type: "REQUEST_LOGIN" });
  };

  const sendWebReady = () => {
    if (isReadyRef.current) return;
    isReadyRef.current = true;
    sendMessage({ type: "WEB_READY" });
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 세션 관리 함수
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * 앱에서 받은 토큰으로 쿠키 세션을 설정합니다.
   */
  const setSession = async (accessToken: string, refreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`${LOG_PREFIX} Session set failed:`, error);
        return false;
      }

      return true;
    } catch (e) {
      console.error(`${LOG_PREFIX} Session set error:`, e);
      return false;
    }
  };

  /**
   * 세션을 삭제합니다.
   */
  const clearSession = async (): Promise<boolean> => {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
      return true;
    } catch (e) {
      console.error(`${LOG_PREFIX} Session clear error:`, e);
      return false;
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 앱 → 웹 메시지 수신 핸들러
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleAppCommand = async (event: CustomEvent<AppToWebCommand>) => {
      const command = event.detail;

      switch (command.type) {
        case "NAVIGATE_HOME":
          router.replace("/");
          break;

        case "NAVIGATE_TO":
          router.replace(command.path);
          break;

        case "GET_ROUTE_INFO":
          sendRouteInfo();
          break;

        case "SET_SESSION": {
          const success = await setSession(command.access_token, command.refresh_token);
          sendMessage({ type: "SESSION_SET", success });

          if (success && pathname === "/login") {
            router.replace("/");
          }
          break;
        }

        case "CLEAR_SESSION":
          await clearSession();
          router.replace("/login");
          break;

        case "LOGIN_ERROR":
          console.error(`${LOG_PREFIX} Login error from app:`, command.error);
          break;
      }
    };

    window.addEventListener("app-command", handleAppCommand);
    return () => window.removeEventListener("app-command", handleAppCommand);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 초기화 및 경로 변경 처리
  // ──────────────────────────────────────────────────────────────────────────

  // 마운트 시 준비 완료 신호 전송
  useEffect(() => {
    if (isInWebView) {
      const timer = setTimeout(() => sendWebReady(), 100);
      return () => clearTimeout(timer);
    }
  });

  // 경로 변경 시 앱에 알림
  useEffect(() => {
    if (isInWebView) {
      sendRouteInfo();
    }
  }, [pathname]);

  return {
    isInWebView,
    sendRouteInfo,
    sendLogout,
    requestLogin,
    sendWebReady,
  };
};
