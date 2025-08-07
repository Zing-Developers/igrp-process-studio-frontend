import { callGateway } from '@/app/(myapp)/lib/api-gateway';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY ?? '';
const API_URL_PROJECT = `${API_URL}/api/v1/projects`;

export async function POST(request: NextRequest) {
  const processId = request.nextUrl.searchParams.get('projectId');
  if (!processId) {
    return NextResponse.json({ error: 'processId is required' }, { status: 400 });
  }
  const body = await request.json();
  const response = await callGateway(`${API_URL_PROJECT}/${processId}/process-definitions`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return NextResponse.json(response);
}
