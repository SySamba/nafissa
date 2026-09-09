/** Format proche du LengthAwarePaginator Laravel (champs utiles au frontend). */
export function laravelPaginated(items, total, page, perPage, fullPathBase) {
  const p = Math.max(1, Number(page) || 1);
  const pp = Math.max(1, Number(perPage) || 10);
  const lastPage = Math.max(1, Math.ceil(total / pp));

  return {
    current_page: p,
    data: items,
    first_page_url: `${fullPathBase}?page=1`,
    from: total === 0 ? null : (p - 1) * pp + 1,
    last_page: lastPage,
    last_page_url: `${fullPathBase}?page=${lastPage}`,
    next_page_url: p < lastPage ? `${fullPathBase}?page=${p + 1}` : null,
    path: fullPathBase,
    per_page: pp,
    prev_page_url: p > 1 ? `${fullPathBase}?page=${p - 1}` : null,
    to: total === 0 ? null : (p - 1) * pp + items.length,
    total,
  };
}

export function appUrl(req) {
  const fromEnv = process.env.APP_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const host = req.headers['x-forwarded-host'] || req.hostname;
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${host}`;
}

export function fullResourcePath(req) {
  return appUrl(req) + (req.url?.split('?')[0] || '');
}
