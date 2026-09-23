import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const participantKey = searchParams.get('participantKey');

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Missing submissionId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Fetch submission metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: submission, error: subError } = await (supabase.from('submissions') as any)
      .select('id, video_path, status, owner_user_id, participant_key')
      .eq('id', submissionId)
      .single();

    if (subError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    let isAuthorized = false;

    // Check Authorization:
    // A. Approved submissions are publicly accessible for video playback
    if (submission.status === 'approved') {
      isAuthorized = true;
    }

    // B. Check if viewer is an authenticated staff member
    if (!isAuthorized) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (submission.owner_user_id === user.id) {
          isAuthorized = true;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: isStaff } = await (supabase as any).rpc('is_staff');
          if (isStaff) {
            isAuthorized = true;
          }
        }
      }
    }

    // C. Check if viewer provided a valid participant secret key
    if (!isAuthorized && participantKey && submission.participant_key === participantKey) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized to access this video' },
        { status: 403 }
      );
    }

    // 2. Generate short-lived (1 hour) signed playback URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from(CONFIG.STORAGE_BUCKET_VIDEOS)
      .createSignedUrl(submission.video_path, 3600);

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate signed video URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      expiresIn: 3600,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
