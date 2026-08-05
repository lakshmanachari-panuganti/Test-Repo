const test = require('node:test');
const assert = require('node:assert/strict');
const { applyDiscount, orderTotal } = require('./pricing');

test('applyDiscount at 0 percent returns the amount unchanged', () => {
  assert.equal(applyDiscount(10000, 0), 10000);
});

test('applyDiscount at 100 percent returns zero', () => {
  assert.equal(applyDiscount(10000, 100), 0);
});

test('applyDiscount above 100 percent throws RangeError', () => {
  assert.throws(() => applyDiscount(10000, 150), RangeError);
});

test('applyDiscount below 0 percent throws RangeError', () => {
  assert.throws(() => applyDiscount(10000, -10), RangeError);
});

test('applyDiscount rounds a result that lands on a fraction of a paisa', () => {
  // 1999 - (1999 * 10 / 100) = 1799.1, rounds to 1799.
  assert.equal(applyDiscount(1999, 10), 1799);
});

test('orderTotal on an empty array returns 0', () => {
  assert.equal(orderTotal([], 18), 0);
});

test('orderTotal on null returns 0 instead of throwing', () => {
  assert.equal(orderTotal(null, 18), 0);
});

test('orderTotal on undefined returns 0 instead of throwing', () => {
  assert.equal(orderTotal(undefined, 18), 0);
});

test('orderTotal throws TypeError when a line item is missing price', () => {
  assert.throws(() => orderTotal([{ qty: 2 }], 18), TypeError);
});

test('orderTotal throws TypeError when a line item is missing qty', () => {
  assert.throws(() => orderTotal([{ price: 100 }], 18), TypeError);
});

test('orderTotal throws RangeError when gstPercent is omitted', () => {
  assert.throws(() => orderTotal([{ price: 100, qty: 1 }]), RangeError);
});

test('orderTotal sums line items and adds GST, rounded to whole paise', () => {
  // (100*2 + 250*1) = 450 paise subtotal, +18% GST = 531 paise.
  assert.equal(orderTotal([{ price: 100, qty: 2 }, { price: 250, qty: 1 }], 18), 531);
});
