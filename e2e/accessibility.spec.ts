import { test, expect, type APIRequestContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

async function createTodo(request: APIRequestContext, title: string) {
  const response = await request.post('/api/todos', { data: { title } });
  if (!response.ok()) throw new Error(`POST /api/todos failed: ${response.status()}`);
  return response.json();
}

test.describe('Accessibility audit', () => {
  test.beforeEach(async ({ request, page }) => {
    await deleteAllTodos(request);
    await page.goto('/');
  });

  test('empty state has no critical or serious axe violations', async ({ page }) => {
    await expect(page.getByText('No todos yet')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(violations).toEqual([]);
  });

  test('state with todos has no critical or serious axe violations', async ({ request, page }) => {
    await createTodo(request, 'Active task');
    await createTodo(request, 'Completed task');
    await page.reload();

    // Complete the second todo
    const checkbox = page.getByRole('checkbox', { name: /Completed task/ });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(violations).toEqual([]);
  });

  test('edit mode has no critical or serious axe violations', async ({ request, page }) => {
    await createTodo(request, 'Edit me');
    await page.reload();

    // Enter edit mode by clicking the text
    await page.getByText('Edit me').click();
    await expect(page.getByRole('list').getByRole('textbox')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(violations).toEqual([]);
  });

  test('error/toast state has no critical or serious axe violations', async ({ page }) => {
    // Trigger a toast by attempting to add an empty todo (won't trigger toast)
    // Instead, create a todo and delete it to trigger the toast flow
    const input = page.getByPlaceholder('Add a new task...');
    await input.fill('Toast trigger');
    await input.press('Enter');
    await expect(page.getByText('Toast trigger')).toBeVisible();

    // Delete the todo — this may or may not show a toast depending on error
    // Instead, let's intercept API to cause an error that triggers a toast
    await page.route('**/api/todos', (route, request) => {
      if (request.method() === 'POST') {
        return route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: 'Server error' }) });
      }
      return route.continue();
    });

    // Try to add a todo — this will fail and show a toast
    await input.fill('Will fail');
    await input.press('Enter');

    // Wait for the toast to appear
    await expect(page.getByText("Couldn't add task. Try again.")).toBeVisible({ timeout: 5000 });

    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(violations).toEqual([]);
  });
});
