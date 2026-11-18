import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await use(errors);
    expect(errors).toEqual([]);
  }, { auto: true }],
});

export { expect };

export async function openGame(page: Page) {
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto('/?seed=12345');
  await page.getByRole('button', { name: 'Start Game', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Tetris game' })).toBeFocused();
  await expect(page.getByRole('status')).toContainText('Game running');
}

export function boardColors(page: Page) {
  return page.getByRole('img', { name: 'Tetris playfield' }).evaluate(board =>
    Array.from(board.children, cell => getComputedStyle(cell).backgroundColor));
}
