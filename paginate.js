// Returns the items on the given 1-based page. Out-of-range pages return an empty array.
// Invalid inputs (non-array items, non-positive-integer page or perPage) also return [].
function paginate(items, page, perPage) {
  if (!Array.isArray(items)) return [];

  const pageNum = Number(page);
  const size = Number(perPage);
  if (!Number.isInteger(pageNum) || pageNum < 1) return [];
  if (!Number.isInteger(size) || size < 1) return [];

  const start = (pageNum - 1) * size;
  return items.slice(start, start + size);
}

module.exports = { paginate };
