// Order total helpers. All monetary values are integer paise, in and out.

// Applies a percentage discount to an amount in paise and returns the
// payable amount in paise, rounded to the nearest whole paisa.
// amountPaise must be a non-negative integer number of paise; throws
// TypeError otherwise (an undefined/null/negative/fractional amount would
// otherwise propagate as NaN, silently become a free order, or produce a
// negative payable amount).
// percent must be a finite number within 0..100 inclusive; throws
// RangeError otherwise (a value outside that range would invert the
// discount into a surcharge or exceed the original amount).
function applyDiscount(amountPaise, percent) {
  if (!Number.isInteger(amountPaise) || amountPaise < 0) {
    throw new TypeError('amountPaise must be a non-negative integer number of paise');
  }
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new RangeError('percent must be a finite number between 0 and 100');
  }
  const discounted = amountPaise - (amountPaise * percent / 100);
  return Math.round(discounted);
}

// Sums item.price * item.qty (paise) across lineItems and adds GST,
// returning the total in paise, rounded to the nearest whole paisa.
// gstPercent must be a finite number >= 0 and is validated first, before
// lineItems is inspected at all, so an invalid/missing gstPercent always
// throws RangeError regardless of whether lineItems happens to be a real
// array or the null/undefined fallback below - the same bad rate must not
// be fatal for one cart shape and silently ignored for another.
// lineItems that isn't an array (e.g. null/undefined from a failed
// upstream cart fetch) returns 0 rather than throwing, matching the
// fallback convention used by paginate.js. Each line item's raw price and
// qty must themselves be non-negative integers, checked by type before any
// coercion (so null, '', [], and false are rejected rather than silently
// coercing to 0 and pricing the item for free); otherwise a TypeError is
// thrown rather than silently propagating a wrong total.
function orderTotal(lineItems, gstPercent) {
  if (!Number.isFinite(gstPercent) || gstPercent < 0) {
    throw new RangeError('gstPercent must be a finite number >= 0');
  }
  if (!Array.isArray(lineItems)) return 0;

  let total = 0;
  for (const item of lineItems) {
    const price = item?.price;
    const qty = item?.qty;
    if (typeof price !== 'number' || !Number.isInteger(price) || price < 0) {
      throw new TypeError('each line item requires a non-negative integer price in paise');
    }
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 0) {
      throw new TypeError('each line item requires a non-negative integer qty');
    }
    total += price * qty;
  }
  return Math.round(total + (total * gstPercent / 100));
}

// Shipping fee for an order, in paise. Orders above the free-shipping
// threshold ship free; everything else pays the flat rate for its zone.
const FREE_SHIPPING_THRESHOLD = 50000;
const ZONE_RATES = { local: 4000, metro: 6000, national: 9000 };

function shippingFee(subtotalPaise, zone) {
  if (subtotalPaise > FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  const rate = ZONE_RATES[zone] || 0;
  return rate;
}

// Grand total in paise: order total plus shipping, less any discount.
function grandTotal(lineItems, gstPercent, zone, discountPercent) {
  const subtotal = orderTotal(lineItems, gstPercent);
  const shipping = shippingFee(subtotal, zone);
  const discounted = applyDiscount(subtotal, discountPercent) / 100;
  return discounted + shipping;
}

module.exports = { applyDiscount, orderTotal, shippingFee, grandTotal };
