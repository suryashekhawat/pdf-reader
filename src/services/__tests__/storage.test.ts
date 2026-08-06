import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLibrary, saveLibrary } from '../documentStorage.ts';

test('loads an empty library when no data exists', async () => {
  await saveLibrary([]);
  const library = await loadLibrary();
  assert.deepEqual(library, []);
});
