"use client";

/**
 * Logout Hook
 *
 * WebView 환경과 일반 웹 환경의 로그아웃 로직을 추상화합니다.
 *
 * - WebView: 앱에 LOGOUT 메시지 전송 → 앱이 세션 정리 및 리다이렉트 처리
 * - Web: Supabase signOut → 로그인 페이지 리다이렉트
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useWebViewBridge } from "./use-webview-bridge";

// ============================================================================
// Types
// ============================================================================

interface UseLogoutResult {
  /** 로그아웃 실행 함수 */
  logout: () => Promise<void>;
  /** 로그아웃 진행 중 여부 */
  isLoggingOut: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export function useLogout(): UseLogoutResult {
  const router = useRouter();
  const supabase = createClient();
  const { isInWebView, sendLogout } = useWebViewBridge();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      if (isInWebView) {
        // WebView 환경: 앱에 로그아웃 메시지 전송
        // 앱이 세션 정리 및 로그인 페이지 리다이렉트 처리
        sendLogout();
        // WebView에서는 앱이 처리하므로 여기서 상태 리셋하지 않음
        return;
      }

      // 일반 웹 환경: 직접 로그아웃 처리
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("[useLogout] Logout failed:", error);
      setIsLoggingOut(false);
    }
  }, [isInWebView, sendLogout, supabase.auth, router]);

  return {
    logout,
    isLoggingOut,
  };
}
