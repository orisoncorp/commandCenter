const BASE_DATA = {
  mrr: { value: 94200, delta: 12.4, label: 'MRR ATUAL' },
  contratos: { value: 47, delta: 8, label: 'CONTRATOS ATIVOS' },
  conversao: { value: 18.4, delta: 3.2, label: 'CONVERSÃO', sparkline: [12, 14, 13, 16, 15, 18, 18.4] },
  churn: { value: 2.1, delta: -0.3, label: 'CHURN RATE', alert: true },
  ticket: { value: 4200, compare: 3800, delta: 10.5, label: 'TICKET MÉDIO' },
  meta: { value: 68, target: 100, label: 'META MENSAL' },
  pipeline: { value: 312000, delta: 15.8, label: 'PIPELINE', sparkline: [180, 220, 250, 280, 295, 310, 312] },
  nps: { value: 82, delta: 4, label: 'NPS' },
};

const CONTRACTS_TABLE = [
  { empresa: 'Acme Corp', contrato: '#4821', mrr: 12400, status: 'ativo', revisao: '2026-06-15' },
  { empresa: 'Beta Industries', contrato: '#4817', mrr: 8200, status: 'ativo', revisao: '2026-07-01' },
  { empresa: 'Gamma SA', contrato: '#4802', mrr: 3100, status: 'atencao', revisao: '2026-05-28' },
  { empresa: 'Delta Corp', contrato: '#4798', mrr: 6500, status: 'ativo', revisao: '2026-08-10' },
  { empresa: 'Epsilon Ltda', contrato: '#4785', mrr: 4800, status: 'trial', revisao: '2026-06-01' },
];

const EVENTS = [
  { type: 'contrato', empresa: 'Zeta SA', value: 6800 },
  { type: 'alerta', empresa: 'Eta Industries', value: -900 },
  { type: 'upsell', empresa: 'Delta Corp', value: 1500 },
  { type: 'churn', empresa: 'Gamma SA', value: -3100 },
  { type: 'contrato', empresa: 'Theta Tech', value: 5200 },
];

export function getMockData() {
  return { ...BASE_DATA };
}

export function getMockTable() {
  return [...CONTRACTS_TABLE];
}

export function getMockEvent() {
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  return {
    ...event,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export function getUpdatedData(current) {
  const updated = { ...current };
  Object.keys(updated).forEach(key => {
    if (updated[key].value && typeof updated[key].value === 'number') {
      const variance = updated[key].value * (Math.random() * 0.04 - 0.02);
      updated[key] = {
        ...updated[key],
        value: Math.round((updated[key].value + variance) * 100) / 100,
      };
    }
  });
  return updated;
}
