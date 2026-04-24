import { prisma } from '@/lib/prisma';
import { CreateTodoSchema } from '@/lib/schemas';
import { successResponse, errorResponse, serializeTodo } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(todos.map(serializeTodo));
  } catch {
    return errorResponse(
      { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      500,
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = CreateTodoSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.issues,
        },
        400,
      );
    }

    const todo = await prisma.todo.create({
      data: { title: parsed.data.title },
    });

    return successResponse(serializeTodo(todo), 201);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return errorResponse(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: [{ message: 'Invalid JSON body' }],
        },
        400,
      );
    }
    return errorResponse(
      { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      500,
    );
  }
}
