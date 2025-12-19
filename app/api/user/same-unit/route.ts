import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { User } from '@/lib/types';

/**
 * GET /api/user/same-unit
 *
 * 같은 부대 사용자 목록 조회
 *
 * 시간 복잡도: O(log n) - idx_users_unit_id 활용
 *
 * Query Parameters:
 * - unitId: unit ID (required)
 * - limit: number of users (default 20, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const unitId = searchParams.get('unitId');
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    if (!unitId) {
      return NextResponse.json(
        { error: 'unitId parameter is required' },
        { status: 400 }
      );
    }

    // Get current authenticated user to exclude self
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    // Query same unit users - O(log n) with idx_users_unit_id
    let query = supabase
      .from('users')
      .select('*')
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Exclude current user if authenticated
    if (authUser) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('id')
        .eq('provider_id', authUser.id)
        .single();

      if (currentUser) {
        query = query.neq('id', currentUser.id);
      }
    }

    const { data: usersData, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    // Map to User type
    const users: User[] = (usersData || []).map((userData) => ({
      id: userData.id,
      providerId: userData.provider_id,
      email: userData.email,
      realName: userData.real_name,
      phoneNumber: userData.phone_number,
      birthDate: userData.birth_date,
      gender: userData.gender,
      nickname: userData.nickname,
      enlistmentMonth: userData.enlistment_month,
      rank: `${userData.rank}-${userData.rank_grade}호봉` as any,
      unitId: userData.unit_id,
      unitName: userData.unit_name,
      specialty: userData.specialty,
      profileImage: userData.profile_image_url,
      bio: userData.bio,
      height: userData.height_cm,
      weight: userData.weight_kg,
      muscleMass: userData.show_body_metrics ? userData.skeletal_muscle_mass_kg : undefined,
      bodyFatPercentage: userData.show_body_metrics ? userData.body_fat_percentage : undefined,
      interestedLocations: userData.interested_exercise_locations,
      interestedExercises: userData.interested_exercise_types,
      isSmoker: userData.is_smoker,
      showInbodyPublic: userData.show_body_metrics,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('[GET /api/user/same-unit]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
