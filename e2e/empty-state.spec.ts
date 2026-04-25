import { test, expect, type APIRequestContext } from '@playwright/test';

async function deleteAllTodos(request: APIRequestContext) {
  const response = await request.get('/api/todos');
  if (!response.ok()) throw new Error(`GET /api/todos failed: ${response.status()}`);
  const body = await response.json();
  if (body.success && body.data) {
    for (const todo of body.data) {
      const del = await request.delete(`/api/todos/${todo.id}`);
      if (!del.ok()) throw new Error(`DELETE /api/todos/${todo.id} failed: ${del.status()}`);
    }
  }
}

test.describe('Empty state flow', () => {
  test.beforeEach(async ({ request }) => {
    await deleteAllTodos(request);
  });

  test('shows empty state when no todos exist', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('No todos yet')).toBeVisible();
  });

  test('empty state disappears after adding a task', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('No todos yet')).toBeVisible();

    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('My first task');
    await input.press('Enter');

    await expect(page.getByText('No todos yet')).not.toBeVisible();
    await expect(page.getByRole('list')).toBeVisible();
    await expect(page.getByText('My first task')).toBeVisible();
  });
});
