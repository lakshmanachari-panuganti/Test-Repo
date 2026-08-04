const test = require('node:test');
const assert = require('node:assert/strict');
const { paginate } = require('./paginate');

const items = ['a', 'b', 'c', 'd', 'e'];

test('first page returns the first perPage items', () => {
  assert.deepEqual(paginate(items, 1, 2), ['a', 'b']);
});

test('last partial page returns only the remainder', () => {
  assert.deepEqual(paginate(items, 3, 2), ['e']);
});

test('page past the end returns an empty array', () => {
  assert.deepEqual(paginate(items, 10, 2), []);
});

test('perPage greater than items.length returns every item', () => {
  assert.deepEqual(paginate(items, 1, 100), items);
});

test('empty items returns an empty array', () => {
  assert.deepEqual(paginate([], 1, 2), []);
});

test('null items returns an empty array instead of throwing', () => {
  assert.deepEqual(paginate(null, 1, 10), []);
});

test('negative page returns an empty array instead of real data', () => {
  assert.deepEqual(paginate(items, -2, 2), []);
});

test('non-numeric perPage does not fall back to string concatenation', () => {
  assert.deepEqual(paginate(items, 1, 'not-a-number'), []);
});
