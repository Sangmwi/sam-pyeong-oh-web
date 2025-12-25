'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { User, SignupCompleteData } from '@/lib/types';
import { queryKeys } from '@/lib/constants/queryKeys';
import { authFetch } from '@/lib/utils/authFetch';

// API functions
const api = {
  // Check nickname availability
  async checkNickname(nickname: string): Promise<{ available: boolean }> {
    const response = await authFetch(`/api/user/check-nickname?nickname=${encodeURIComponent(nickname)}`);
    if (!response.ok) throw new Error('Failed to check nickname');
    return response.json();
  },

  // Complete signup (creates User)
  async completeSignup(data: SignupCompleteData): Promise<User> {
    const response = await authFetch('/api/signup/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      if (contentType?.includes('application/json')) {
        const error = await response.json();
        const errorMessage = error.details || error.error || error.message || 'Failed to complete signup';
        throw new Error(errorMessage);
      } else {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    if (!contentType?.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    return response.json();
  },

  // Sign out
  async signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'local' });
  },
};

// React Query hooks

/**
 * Check if nickname is available
 */
export function useCheckNickname(nickname: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.user.checkNickname(nickname),
    queryFn: () => api.checkNickname(nickname),
    enabled: enabled && nickname.length >= 2,
  });
}

/**
 * Complete signup mutation
 */
export function useCompleteSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.completeSignup,
    onSuccess: (data) => {
      // 캐시 업데이트
      queryClient.setQueryData(queryKeys.user.me(), data);
    },
  });
}

/**
 * Sign out mutation
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.signOut,
    onSuccess: () => {
      queryClient.clear();

      // Notify app for WebView reset
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOGOUT' }));
      }
    },
  });
}
