/**
 * 세션 관리 API
 *
 * 앱에서 네이티브 OAuth로 받은 토큰을 웹 쿠키 세션으로 변환합니다.
 * 이를 통해 WebView에서도 쿠키 기반 인증을 사용할 수 있습니다.
 *
 * POST: 토큰으로 쿠키 세션 설정
 * DELETE: 세션 삭제 (로그아웃)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================================================
// POST /api/auth/session - 토큰으로 쿠키 세션 설정
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body;

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: 'access_token and refresh_token are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // Supabase 클라이언트 생성 (쿠키 설정 가능하도록)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // 보안 설정 강화
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              });
            });
          },
        },
      }
    );

    // 토큰으로 세션 설정 → Supabase가 자동으로 쿠키에 저장
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      console.error('[API] Session set failed:', error.message);
      return NextResponse.json(
        { error: 'Invalid tokens', details: error.message },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    console.log('[API] Session set for:', data.user?.email);

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      expires_at: data.session.expires_at,
    });
  } catch (error) {
    console.error('[API] Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/auth/session - 세션 삭제 (로그아웃)
// ============================================================================

export async function DELETE() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[API] Logout failed:', error.message);
      // 에러가 있어도 쿠키는 삭제 시도
    }

    // Supabase 관련 쿠키 명시적 삭제
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
        cookieStore.delete(cookie.name);
      }
    }

    console.log('[API] Session cleared');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
