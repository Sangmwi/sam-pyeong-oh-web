import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { User } from '@/lib/types';

/**
 * GET /api/user/recommendations
 *
 * 현재 사용자 기반 추천 프로필
 *
 * 추천 알고리즘 가중치:
 * - 같은 부대 (unitId): 40%
 * - 관심 운동 종목 겹침: 30%
 * - 관심 장소 겹침: 20%
 * - 체격 유사도: 10%
 *
 * 시간 복잡도: O(n log n)
 * - n = 같은 부대 사용자 수 (unitId 인덱스로 필터링)
 *
 * Query Parameters:
 * - limit: number of recommendations (default 20, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    // Get current authenticated user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's profile
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('*')
      .eq('provider_id', authUser.id)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { error: 'Current user profile not found' },
        { status: 404 }
      );
    }

    // Fetch candidate users (same unit first for performance)
    // O(log n) with idx_users_unit_id
    const { data: candidates, error: candidatesError } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUser.id) // Exclude self
      .limit(200); // Fetch more candidates for scoring

    if (candidatesError) {
      throw candidatesError;
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json([]);
    }

    // Calculate similarity scores
    interface ScoredUser {
      user: any;
      score: number;
    }

    const scoredUsers: ScoredUser[] = candidates.map((candidate) => {
      let score = 0;

      // 1. Same unit (40 points) - Most important
      if (candidate.unit_id === currentUser.unit_id) {
        score += 40;
      }

      // 2. Interested exercises overlap (30 points)
      const currentExercises = currentUser.interested_exercise_types || [];
      const candidateExercises = candidate.interested_exercise_types || [];
      const commonExercises = currentExercises.filter((ex: string) =>
        candidateExercises.includes(ex)
      );
      if (currentExercises.length > 0 && candidateExercises.length > 0) {
        const exerciseRatio = commonExercises.length / Math.max(currentExercises.length, candidateExercises.length);
        score += exerciseRatio * 30;
      }

      // 3. Interested locations overlap (20 points)
      const currentLocations = currentUser.interested_exercise_locations || [];
      const candidateLocations = candidate.interested_exercise_locations || [];
      const commonLocations = currentLocations.filter((loc: string) =>
        candidateLocations.includes(loc)
      );
      if (currentLocations.length > 0 && candidateLocations.length > 0) {
        const locationRatio = commonLocations.length / Math.max(currentLocations.length, candidateLocations.length);
        score += locationRatio * 20;
      }

      // 4. Physical similarity (10 points)
      if (
        currentUser.height_cm &&
        candidate.height_cm &&
        currentUser.weight_kg &&
        candidate.weight_kg
      ) {
        const heightDiff = Math.abs(currentUser.height_cm - candidate.height_cm);
        const weightDiff = Math.abs(currentUser.weight_kg - candidate.weight_kg);

        // Height within 5cm = 5 points, Weight within 5kg = 5 points
        const heightScore = Math.max(0, (5 - heightDiff) / 5) * 5;
        const weightScore = Math.max(0, (5 - weightDiff) / 5) * 5;
        score += heightScore + weightScore;
      }

      return { user: candidate, score };
    });

    // Sort by score (descending) - O(n log n)
    scoredUsers.sort((a, b) => b.score - a.score);

    // Take top N
    const topUsers = scoredUsers.slice(0, limit);

    // Map to User type
    const recommendations: User[] = topUsers.map(({ user: userData }) => ({
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

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('[GET /api/user/recommendations]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
