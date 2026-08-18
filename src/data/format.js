// Single source of truth for value formatting.
// Intl formatters are expensive to construct — build each once, reuse forever.

const _brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const _date = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatBRL(v) {
  if (!Number.isFinite(v)) return '—';
  return _brl.format(v);
}

export function formatCompact(v) {
  if (!Number.isFinite(v)) return '—';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${abs.toFixed(abs % 1 !== 0 ? 1 : 0)}`;
}

// Compact currency for dense contexts (event feed). Signed, because the sign
// carries the meaning there.
export function formatBRLCompact(v) {
  if (!Number.isFinite(v)) return '—';
  return `${v < 0 ? '-' : '+'}R$ ${formatCompact(Math.abs(v))}`;
}

export function formatPercent(v, decimals = 1) {
  if (!Number.isFinite(v)) return '—';
  return `${v.toFixed(decimals)}%`;
}

export function formatDelta(v, decimals = 1) {
  if (!Number.isFinite(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`;
}

// `new Date('2026-06-15')` parses as UTC midnight, which renders as the previous
// day in every timezone west of Greenwich (all of Brazil). Parse date-only
// strings as local instead.
export function parseLocalDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value) {
  const d = parseLocalDate(value);
  return d ? _date.format(d) : '—';
}

export function formatValue(v, format) {
  if (format === 'currency') return formatBRL(v);
  if (format === 'percent') return formatPercent(v);
  return formatCompact(v);
}
