// Cached Intl formatters — created once, reused on every call
const _brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatBRL(v) {
  return _brl.format(v);
}

export function formatCompact(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toFixed(v % 1 !== 0 ? 1 : 0);
}

export function formatPercent(v) {
  return `${v.toFixed(1)}%`;
}

export function formatValue(v, format) {
  if (format === 'currency') return formatBRL(v);
  if (format === 'percent') return formatPercent(v);
  return formatCompact(v);
}
