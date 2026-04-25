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

test.describe('Todo CRUD operations', () => {
  test.beforeEach(async ({ request, page }) => {
    await deleteAllTodos(request);
    await page.goto('/');
  });

  test('creates a new todo via Enter key', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Buy groceries');
    await input.press('Enter');

    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(input).toBeEmpty();
    await expect(input).toBeFocused();
  });

  test('creates a new todo via Add button', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Walk the dog');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByText('Walk the dog')).toBeVisible();
    await expect(input).toBeEmpty();
    await expect(input).toBeFocused();
  });

  test('completes a todo by clicking checkbox', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Read a book');
    await input.press('Enter');
    await expect(page.getByText('Read a book')).toBeVisible();

    const checkbox = page.getByRole('checkbox', { name: /Read a book/ });
    await checkbox.click();

    const listItem = page.getByRole('listitem').filter({ hasText: 'Read a book' });
    const todoText = listItem.locator('span').filter({ hasText: 'Read a book' });
    await expect(todoText).toHaveCSS('text-decoration-line', 'line-through');
    await expect(checkbox).toBeChecked();
  });

  test('toggles a completed todo back to active', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Read a book');
    await input.press('Enter');
    await expect(page.getByText('Read a book')).toBeVisible();

    const checkbox = page.getByRole('checkbox', { name: /Read a book/ });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Toggle back
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    const listItem = page.getByRole('listitem').filter({ hasText: 'Read a book' });
    const todoText = listItem.locator('span').filter({ hasText: 'Read a book' });
    await expect(todoText).not.toHaveCSS('text-decoration-line', 'line-through');
  });

  test('edits a todo via Edit button and Enter key', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Old task name');
    await input.press('Enter');
    await expect(page.getByText('Old task name')).toBeVisible();

    const listItem = page.getByRole('listitem').filter({ hasText: 'Old task name' });
    await listItem.hover();
    await listItem.getByRole('button', { name: 'Edit' }).click();

    const editInput = page.getByRole('list').getByRole('textbox');
    await expect(editInput).toBeVisible();
    await editInput.fill('New task name');
    await editInput.press('Enter');

    await expect(page.getByText('New task name')).toBeVisible();
    await expect(page.getByText('Old task name')).not.toBeVisible();
  });

  test('edits a todo by clicking text directly', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Click to edit');
    await input.press('Enter');
    await expect(page.getByText('Click to edit')).toBeVisible();

    await page.getByText('Click to edit').click();

    const editInput = page.getByRole('list').getByRole('textbox');
    await expect(editInput).toBeVisible();
    await editInput.fill('Edited via click');
    await editInput.press('Enter');

    await expect(page.getByText('Edited via click')).toBeVisible();
    await expect(page.getByText('Click to edit')).not.toBeVisible();
  });

  test('cancels editing a todo with Escape', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Keep this name');
    await input.press('Enter');
    await expect(page.getByText('Keep this name')).toBeVisible();

    const listItem = page.getByRole('listitem').filter({ hasText: 'Keep this name' });
    await listItem.hover();
    await listItem.getByRole('button', { name: 'Edit' }).click();

    const editInput = page.getByRole('list').getByRole('textbox');
    await expect(editInput).toBeVisible();
    await editInput.fill('Changed text');
    await editInput.press('Escape');

    await expect(page.getByText('Keep this name')).toBeVisible();
    await expect(page.getByText('Changed text')).not.toBeVisible();
  });

  test('deletes a todo', async ({ page }) => {
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Delete me');
    await input.press('Enter');
    await expect(page.getByText('Delete me')).toBeVisible();

    const listItem = page.getByRole('listitem').filter({ hasText: 'Delete me' });
    await listItem.hover();
    await listItem.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('Delete me')).not.toBeVisible();
  });
});
