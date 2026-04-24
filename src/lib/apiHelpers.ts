import { NextResponse } from 'next/server';
import { ApiError } from './types';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data, success: true }, { status });
}

export function errorResponse(error: ApiError, status = 500) {
  return NextResponse.json({ error, success: false }, { status });
}
