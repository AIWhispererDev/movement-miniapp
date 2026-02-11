import { NextRequest, NextResponse } from 'next/server';
import { runAutomatedReview } from '@/lib/reviewService';
import { AppMetadata } from '@/types/app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const app: AppMetadata = body.app;

    if (!app || !app.url) {
      return NextResponse.json(
        { error: 'Missing required app data' },
        { status: 400 }
      );
    }

    const result = await runAutomatedReview(app);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Automated review error:', error);
    return NextResponse.json(
      { error: 'Failed to run automated review', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
