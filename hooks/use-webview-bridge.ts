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

import { useEffect, useCallback, useRef } from "react";
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

  const sendMessage = useCallback((message: WebToAppMessage) => {
    if (!window.ReactNativeWebView) return false;
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
    return true;
  }, []);

  const sendRouteInfo = useCallback(() => {
    sendMessage({
      type: "ROUTE_INFO",
      payload: {
        path: pathname,
        isTabRoute: isTabRoute(pathname),
        isHome: pathname === "/",
        canGoBack: !isTabRoute(pathname),
      },
    });
  }, [pathname, sendMessage]);

  const sendLogout = useCallback(() => {
    sendMessage({ type: "LOGOUT" });
  }, [sendMessage]);

  const requestLogin = useCallback(() => {
    return sendMessage({ type: "REQUEST_LOGIN" });
  }, [sendMessage]);

  const sendWebReady = useCallback(() => {
    if (isReadyRef.current) return;
    isReadyRef.current = true;
    sendMessage({ type: "WEB_READY" });
    console.log(`${LOG_PREFIX} Web ready signal sent`);
  }, [sendMessage]);

  // ──────────────────────────────────────────────────────────────────────────
  // 세션 관리 함수
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * 앱에서 받은 토큰으로 쿠키 세션을 설정합니다.
   */
  const setSession = useCallback(
    async (accessToken: string, refreshToken: string): Promise<boolean> => {
      console.log(`${LOG_PREFIX} Setting session via API...`);

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

        console.log(`${LOG_PREFIX} Session set successfully`);
        return true;
      } catch (e) {
        console.error(`${LOG_PREFIX} Session set error:`, e);
        return false;
      }
    },
    []
  );

  /**
   * 세션을 삭제합니다.
   */
  const clearSession = useCallback(async (): Promise<boolean> => {
    console.log(`${LOG_PREFIX} Clearing session...`);

    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });

      console.log(`${LOG_PREFIX} Session cleared`);
      return true;
    } catch (e) {
      console.error(`${LOG_PREFIX} Session clear error:`, e);
      return false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // 앱 → 웹 메시지 수신 핸들러
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleAppCommand = async (event: CustomEvent<AppToWebCommand>) => {
      const command = event.detail;
      console.log(`${LOG_PREFIX} Received:`, command.type);

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

          // 세션 설정 성공 시 홈으로 리다이렉트
          if (success && pathname === "/login") {
            console.log(`${LOG_PREFIX} Session set on login page, redirecting to home`);
            router.replace("/");
          }
          break;
        }

        case "CLEAR_SESSION":
          await clearSession();
          break;

        case "LOGIN_ERROR":
          console.error(`${LOG_PREFIX} Login error from app:`, command.error);
          break;
      }
    };

    window.addEventListener("app-command", handleAppCommand);
    return () => window.removeEventListener("app-command", handleAppCommand);
  }, [router, pathname, sendRouteInfo, sendMessage, setSession, clearSession]);

  // ──────────────────────────────────────────────────────────────────────────
  // 초기화 및 경로 변경 처리
  // ──────────────────────────────────────────────────────────────────────────

  // 마운트 시 준비 완료 신호 전송
  useEffect(() => {
    if (isInWebView) {
      const timer = setTimeout(() => sendWebReady(), 100);
      return () => clearTimeout(timer);
    }
  }, [isInWebView, sendWebReady]);

  // 경로 변경 시 앱에 알림
  useEffect(() => {
    if (isInWebView) {
      sendRouteInfo();
    }
  }, [pathname, isInWebView, sendRouteInfo]);

  return {
    isInWebView,
    sendRouteInfo,
    sendLogout,
    requestLogin,
    sendWebReady,
  };
};
