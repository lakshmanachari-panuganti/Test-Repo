// Returns the items on the given page.
// Deliberate defect for the agent-review trial: the slice start is off by one page,
// so page 1 silently skips the first item and every page is misaligned.
function paginate(items, page, perPage) {
  const start = page * perPage;
  return items.slice(start, start + perPage);
}

module.exports = { paginate };
