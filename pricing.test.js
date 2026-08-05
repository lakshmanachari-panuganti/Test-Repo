const test = require('node:test');
const assert = require('node:assert/strict');
const { applyDiscount, orderTotal, shippingFee, grandTotal } = require('./pricing');

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

test('applyDiscount throws TypeError when amountPaise is undefined', () => {
  // Number.isInteger(undefined) is false, so this must throw rather than
  // let `undefined - NaN` (NaN) travel onward as a payable amount.
  assert.throws(() => applyDiscount(undefined, 10), TypeError);
});

test('applyDiscount throws TypeError when amountPaise is null', () => {
  // Number.isInteger(null) is false, so this must throw rather than let
  // `null` coerce to 0 in arithmetic and silently make the order free.
  assert.throws(() => applyDiscount(null, 10), TypeError);
});

test('applyDiscount throws TypeError when amountPaise is negative', () => {
  // -5000 is a valid integer, so this exercises the `< 0` half of the
  // guard specifically, not the Number.isInteger half.
  assert.throws(() => applyDiscount(-5000, 10), TypeError);
});

test('applyDiscount throws TypeError when amountPaise is fractional', () => {
  // 1000.5 passes Number.isFinite but must fail Number.isInteger, since
  // the header comment promises integer paise in and out.
  assert.throws(() => applyDiscount(1000.5, 10), TypeError);
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

test('orderTotal throws TypeError when a line item has a null price', () => {
  // Number(null) is 0, which used to pass Number.isFinite and silently
  // price the item at zero instead of throwing. typeof null !== 'number'
  // catches this before any coercion happens.
  assert.throws(() => orderTotal([{ price: null, qty: 2 }], 18), TypeError);
});

test('orderTotal throws TypeError when a line item has a null qty', () => {
  // Mirror of the null-price case: Number(null) is 0, which used to pass
  // Number.isInteger(0) && 0 >= 0 and silently price the item at zero.
  assert.throws(() => orderTotal([{ price: 19900, qty: null }], 18), TypeError);
});

test('orderTotal throws TypeError when a line item has a fractional price', () => {
  // 10.5 passes Number.isFinite but must fail the Number.isInteger check,
  // matching the header comment's "integer paise in and out" contract.
  assert.throws(() => orderTotal([{ price: 10.5, qty: 3 }], 0), TypeError);
});

test('orderTotal throws RangeError when gstPercent is omitted', () => {
  assert.throws(() => orderTotal([{ price: 100, qty: 1 }]), RangeError);
});

test('orderTotal throws RangeError for invalid gstPercent even when lineItems is null', () => {
  // gstPercent is now validated before the Array.isArray fallback, so an
  // invalid rate is fatal regardless of cart shape instead of being
  // silently swallowed by the null/undefined-lineItems short-circuit.
  assert.throws(() => orderTotal(null, undefined), RangeError);
});

test('orderTotal sums line items and adds GST, rounded to whole paise', () => {
  // (100*2 + 250*1) = 450 paise subtotal, +18% GST = 531 paise.
  assert.equal(orderTotal([{ price: 100, qty: 2 }, { price: 250, qty: 1 }], 18), 531);
});

test('shippingFee charges the zone rate below the free-shipping threshold', () => {
  assert.equal(shippingFee(20000, 'metro'), 6000);
});

test('shippingFee is free above the threshold', () => {
  assert.equal(shippingFee(60000, 'metro'), 0);
});

test('grandTotal adds shipping to the discounted order total', () => {
  assert.equal(grandTotal([{ price: 10000, qty: 1 }], 0, 'local', 0), 4100);
});
