import { expect, it } from 'vitest';
import { readSeed } from './seed';

it.each(['', '?seed=', '?seed=-1', '?seed=1.5', '?seed=NaN', '?seed=4294967296'])('rejects invalid replay seed %s', search => {
  expect(readSeed(search)).toBeUndefined();
});

it.each([0, 12345, 0xffffffff])('accepts reproducible unsigned seed %s', seed => {
  expect(readSeed(`?seed=${seed}`)).toBe(seed);
});
