// Order total helpers. All monetary values are integer paise, in and out.

// Applies a percentage discount to an amount in paise and returns the
// payable amount in paise, rounded to the nearest whole paisa.
// percent must be a finite number within 0..100 inclusive; throws
// RangeError otherwise (a value outside that range would invert the
// discount into a surcharge or exceed the original amount).
function applyDiscount(amountPaise, percent) {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new RangeError('percent must be a finite number between 0 and 100');
  }
  const discounted = amountPaise - (amountPaise * percent / 100);
  return Math.round(discounted);
}

// Sums item.price * item.qty (paise) across lineItems and adds GST,
// returning the total in paise, rounded to the nearest whole paisa.
// lineItems that isn't an array (e.g. null/undefined from a failed
// upstream cart fetch) returns 0 rather than throwing, matching the
// fallback convention used by paginate.js. gstPercent must be a finite
// number >= 0. Each line item must have a finite price and a
// non-negative integer qty; otherwise a TypeError/RangeError is thrown
// rather than silently propagating NaN as a charge amount.
function orderTotal(lineItems, gstPercent) {
  if (!Array.isArray(lineItems)) return 0;
  if (!Number.isFinite(gstPercent) || gstPercent < 0) {
    throw new RangeError('gstPercent must be a finite number >= 0');
  }

  let total = 0;
  for (const item of lineItems) {
    const price = Number(item?.price);
    const qty = Number(item?.qty);
    if (!Number.isFinite(price) || !Number.isInteger(qty) || qty < 0) {
      throw new TypeError('each line item requires a finite price and a non-negative integer qty');
    }
    total += price * qty;
  }
  return Math.round(total + (total * gstPercent / 100));
}

module.exports = { applyDiscount, orderTotal };
