import AxeBuilder from '@axe-core/playwright';
import { boardColors, expect, openGame, test } from './fixtures';

test('keyboard movement, soft drop, gravity and explicit pause/resume work together', async ({
  page,
}) => {
  await openGame(page);
  const first = await boardColors(page);
  await page.keyboard.press('ArrowRight');
  expect(await boardColors(page)).not.toEqual(first);
  await page.keyboard.press('ArrowDown');
  const softDropped = await boardColors(page);
  await page.clock.runFor(1000);
  await expect.poll(() => boardColors(page)).not.toEqual(softDropped);
  await page.keyboard.press('p');
  const paused = await boardColors(page);
  await page.keyboard.press('ArrowDown');
  await page.clock.runFor(5000);
  expect(await boardColors(page)).toEqual(paused);
  await page.getByRole('button', { name: 'Resume game' }).click();
  await page.clock.runFor(1000);
  await expect.poll(() => boardColors(page)).not.toEqual(paused);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await expect(page.getByRole('status')).toContainText('Game paused');
  await page.getByRole('region', { name: 'Tetris game' }).focus();
  await expect(page.getByRole('status')).toContainText('Game paused');
});

test('restarts replay the same seed and terminal games reject further input', async ({ page }) => {
  await openGame(page);
  await page.keyboard.press('Space');
  await page.keyboard.press('Space');
  const replay = await boardColors(page);
  await page.getByRole('button', { name: 'Restart Game' }).click();
  await page.keyboard.press('Space');
  await page.keyboard.press('Space');
  expect(await boardColors(page)).toEqual(replay);
  for (let index = 0; index < 40; index += 1) {
    if ((await page.getByRole('status').textContent())?.startsWith('Game over')) break;
    await page.keyboard.press('Space');
  }
  await expect(page.getByText('Game Over', { exact: true })).toBeVisible();
  const terminal = await boardColors(page);
  await page.keyboard.press('ArrowLeft');
  await page.clock.runFor(5000);
  expect(await boardColors(page)).toEqual(terminal);
  await page.getByRole('button', { name: 'Start Game', exact: true }).click();
  await expect(page.getByText('Score: 0', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Game running');
});

test('narrow layouts support on-screen pointer controls without horizontal overflow', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openGame(page);
  const first = await boardColors(page);
  const left = page.getByRole('button', { name: 'Move left', exact: true });
  if (info.project.name === 'mobile') await left.tap();
  else await left.click();
  expect(await boardColors(page)).not.toEqual(first);
  const moved = await boardColors(page);
  await page.getByRole('button', { name: 'Rotate piece', exact: true }).click();
  expect(await boardColors(page)).not.toEqual(moved);
  await page.getByRole('button', { name: 'Hard drop', exact: true }).click();
  expect(
    (await boardColors(page)).filter((color) => color.replace(/\s/g, '') !== 'rgba(0,0,0,0.8)'),
  ).toHaveLength(8);
  for (const width of [320, 360, 430]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByRole('button', { name: 'Rotate piece', exact: true })).toBeVisible();
  }
});

test('running and paused controls pass automated WCAG A/AA checks', async ({ page }) => {
  await openGame(page);
  await page.clock.resume();
  for (const paused of [false, true]) {
    if (paused) await page.keyboard.press('p');
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
    ).toEqual([]);
  }
});
