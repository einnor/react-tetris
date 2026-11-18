export function readSeed(search: string): number | undefined {
  const raw = new URLSearchParams(search).get('seed');
  if (raw === null || !/^\d{1,10}$/.test(raw)) return undefined;
  const value = Number(raw);
  return value <= 0xffffffff ? value : undefined;
}
