import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/user/profile/image
 *
 * 프로필 이미지 업로드
 *
 * Request Body (FormData):
 * - file: File
 * - type: 'main' | 'additional'
 *
 * @returns { url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user profile
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('provider_id', authUser.id)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!['main', 'additional'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "main" or "additional"' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    // IMPORTANT: Use authUser.id (auth.uid) to match RLS policy
    const fileExt = file.name.split('.').pop();
    const fileName = `${authUser.id}/${type}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Image Upload Error]', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-images').getPublicUrl(fileName);

    // Add cache-busting query parameter to force CDN/browser to fetch new image
    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

    // Update user profile if main image
    if (type === 'main') {
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: cacheBustedUrl })
        .eq('provider_id', authUser.id);

      if (updateError) {
        console.error('[Profile Update Error]', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile image' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ url: cacheBustedUrl });
  } catch (error) {
    console.error('[POST /api/user/profile/image]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/profile/image
 *
 * 프로필 이미지 삭제
 *
 * Request Body:
 * - imageUrl: string
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user profile
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, profile_image_url')
      .eq('provider_id', authUser.id)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    // Extract file path from URL
    // Example URL: https://{project}.supabase.co/storage/v1/object/public/profile-images/{userId}/main-123.jpg
    const urlParts = imageUrl.split('/profile-images/');
    if (urlParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      );
    }

    const filePath = urlParts[1];

    // Verify ownership (file path should start with auth user ID)
    // IMPORTANT: Use authUser.id (auth.uid) to match RLS policy
    if (!filePath.startsWith(authUser.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this image' },
        { status: 403 }
      );
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profile-images')
      .remove([filePath]);

    if (deleteError) {
      console.error('[Image Delete Error]', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    // If this was the main profile image, clear from user profile
    if (currentUser.profile_image_url === imageUrl) {
      await supabase
        .from('users')
        .update({ profile_image_url: null })
        .eq('id', currentUser.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/user/profile/image]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
