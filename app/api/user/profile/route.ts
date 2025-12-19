import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * PATCH /api/user/profile
 * Update user profile
 *
 * Body: {
 *   nickname?: string;
 *   profileImage?: string;
 *   bio?: string;
 *   height?: number;
 *   weight?: number;
 *   muscleMass?: number;
 *   bodyFatPercentage?: number;
 *   interestedLocations?: string[];
 *   interestedExercises?: string[];
 *   isSmoker?: boolean;
 *   showInbodyPublic?: boolean;
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // If nickname is being updated, check availability
    if (body.nickname) {
      const { data: nicknameCheck } = await supabase
        .from('users')
        .select('id')
        .eq('nickname', body.nickname)
        .neq('provider_id', authUser.id)
        .maybeSingle();

      if (nicknameCheck) {
        return NextResponse.json({ error: 'Nickname already taken' }, { status: 409 });
      }
    }

    // Build update object (transform camelCase to snake_case)
    const updateData: Record<string, any> = {};

    if (body.nickname !== undefined) updateData.nickname = body.nickname;
    if (body.profileImage !== undefined) updateData.profile_image = body.profileImage;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.height !== undefined) updateData.height = body.height;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.muscleMass !== undefined) updateData.muscle_mass = body.muscleMass;
    if (body.bodyFatPercentage !== undefined) updateData.body_fat_percentage = body.bodyFatPercentage;
    if (body.interestedLocations !== undefined) updateData.interested_locations = body.interestedLocations;
    if (body.interestedExercises !== undefined) updateData.interested_exercises = body.interestedExercises;
    if (body.isSmoker !== undefined) updateData.is_smoker = body.isSmoker;
    if (body.showInbodyPublic !== undefined) updateData.show_inbody_public = body.showInbodyPublic;

    updateData.updated_at = new Date().toISOString();

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('provider_id', authUser.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Transform response to camelCase
    const transformedUser = {
      id: updatedUser.id,
      providerId: updatedUser.provider_id,
      email: updatedUser.email,
      realName: updatedUser.real_name,
      phoneNumber: updatedUser.phone_number,
      birthDate: updatedUser.birth_date,
      gender: updatedUser.gender,
      nickname: updatedUser.nickname,
      enlistmentMonth: updatedUser.enlistment_month,
      rank: updatedUser.rank,
      unitId: updatedUser.unit_id,
      unitName: updatedUser.unit_name,
      specialty: updatedUser.specialty,
      profileImage: updatedUser.profile_image,
      bio: updatedUser.bio,
      height: updatedUser.height,
      weight: updatedUser.weight,
      muscleMass: updatedUser.muscle_mass,
      bodyFatPercentage: updatedUser.body_fat_percentage,
      interestedLocations: updatedUser.interested_locations,
      interestedExercises: updatedUser.interested_exercises,
      isSmoker: updatedUser.is_smoker,
      showInbodyPublic: updatedUser.show_inbody_public,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
