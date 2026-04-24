import { prisma } from '@/lib/prisma';
import { UpdateTodoSchema } from '@/lib/schemas';
import { successResponse, errorResponse, serializeTodo } from '@/lib/apiHelpers';
import { PrismaClientKnownRequestError } from '@/generated/prisma/internal/prismaNamespace';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = UpdateTodoSchema.safeParse(body);

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

    const todo = await prisma.todo.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(serializeTodo(todo));
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
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return errorResponse(
        { message: 'Todo not found', code: 'NOT_FOUND' },
        404,
      );
    }
    return errorResponse(
      { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      500,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.todo.delete({
      where: { id },
    });

    return successResponse({ id });
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return errorResponse(
        { message: 'Todo not found', code: 'NOT_FOUND' },
        404,
      );
    }
    return errorResponse(
      { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      500,
    );
  }
}
