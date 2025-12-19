import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/user/me
 * Get current authenticated user's profile
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('provider_id', authUser.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      throw error;
    }

    // Transform database columns to camelCase
    const transformedUser = {
      id: user.id,
      providerId: user.provider_id,
      email: user.email,
      realName: user.real_name,
      phoneNumber: user.phone_number,
      birthDate: user.birth_date,
      gender: user.gender,
      nickname: user.nickname,
      enlistmentMonth: user.enlistment_month,
      rank: user.rank,
      unitId: user.unit_id,
      unitName: user.unit_name,
      specialty: user.specialty,
      profileImage: user.profile_image_url,
      bio: user.bio,
      height: user.height_cm,
      weight: user.weight_kg,
      muscleMass: user.skeletal_muscle_mass_kg,
      bodyFatPercentage: user.body_fat_percentage,
      interestedLocations: user.interested_exercise_locations,
      interestedExercises: user.interested_exercise_types,
      isSmoker: user.is_smoker,
      showInbodyPublic: user.show_body_metrics,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
