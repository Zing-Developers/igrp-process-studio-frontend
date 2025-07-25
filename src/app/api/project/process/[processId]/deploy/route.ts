import { callGateway } from '@/app/(myapp)/lib/api-gateway';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY ?? '';
const API_URL_PROJECT = `${API_URL}/api/v1/projects`;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ processId: string }> },
) {
  const { processId } = await params;
  const body = await request.json();
  const response = await callGateway(
    `${API_URL_PROJECT}/process-definitions/${processId}/deploy`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return NextResponse.json(response);
}
