import { NextResponse } from 'next/server';
import type { ApiError, Todo } from './types';
import type { Todo as PrismaTodo } from '@/generated/prisma/client';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data, success: true }, { status });
}

export function errorResponse(error: ApiError, status = 500) {
  return NextResponse.json({ error, success: false }, { status });
}

export function serializeTodo(todo: PrismaTodo): Todo {
  return {
    ...todo,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}
