import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/user/check-nickname?nickname=...
 * Check if nickname is available
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nickname = searchParams.get('nickname');

    if (!nickname) {
      return NextResponse.json({ error: 'Nickname is required' }, { status: 400 });
    }

    if (nickname.length < 2) {
      return NextResponse.json({ available: false, reason: 'Too short' });
    }

    const supabase = await createClient();

    // Check if nickname exists
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', nickname)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      available: !data,
    });
  } catch (error) {
    console.error('Error checking nickname:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
