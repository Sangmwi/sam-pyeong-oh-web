"use client";

import { useWebViewBridge, useSessionRefresh } from "@/hooks";

// WebView 환경에서 필요한 클라이언트 로직을 활성화하는 컴포넌트
export default function WebViewBridge() {
  useWebViewBridge();
  useSessionRefresh(); // 백그라운드 복귀 시 세션 자동 갱신
  return null;
}

