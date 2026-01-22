// Serve the same image with .png extension for Slack/Discord compatibility
// These platforms require file extensions in image URLs
import { GET as shareGET } from '../share/route';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Re-export the GET handler from the share route
export async function GET(request: NextRequest) {
  return shareGET(request);
}

