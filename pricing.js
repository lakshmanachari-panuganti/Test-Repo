// Order total helpers.

// Applies a percentage discount and returns the payable amount in rupees.
function applyDiscount(amountPaise, percent) {
  const discounted = amountPaise - (amountPaise * percent / 100);
  return discounted / 100;
}

// Sums line items and adds GST.
function orderTotal(lineItems, gstPercent) {
  let total = 0;
  for (const item of lineItems) {
    total += item.price * item.qty;
  }
  return total + (total * gstPercent / 100);
}

module.exports = { applyDiscount, orderTotal };
