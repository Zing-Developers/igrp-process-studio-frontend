import { callGateway } from '@/app/(myapp)/lib/api-gateway';
import { ProcessDefinition } from '@/app/(myapp)/types/global';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY ?? '';
const API_URL_PROJECT = `${API_URL}/api/v1/projects`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ processId: string }> },
) {
  const { processId } = await params;
  const response = await callGateway<ProcessDefinition>(
    `${API_URL_PROJECT}/process-definitions/${processId}`,
    {
      method: 'GET',
    },
  );
  return NextResponse.json(response);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ processId: string }> },
) {
  const { processId } = await params;
  const body = await request.json();
  const response = await callGateway<ProcessDefinition>(
    `${API_URL_PROJECT}/process-definitions/${processId}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  );
  return NextResponse.json(response);
}
