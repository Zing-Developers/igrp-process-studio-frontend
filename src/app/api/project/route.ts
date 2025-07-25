//implement GET With MOCk data..
import { callGateway } from '@/app/(myapp)/lib/api-gateway';
import { PaginatedResponse, Project } from '@/app/(myapp)/types/global';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY ?? '';
const API_URL_PROJECT = `${API_URL}/api/v1/projects`;

export async function GET() {
  const response = await callGateway<PaginatedResponse<Project>>(API_URL_PROJECT, {
    method: 'GET',
  });
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const body = await request.json();
  const response = await callGateway(API_URL_PROJECT, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return NextResponse.json(response);
}
