import {
  getMockData,
  getMockTable,
  getMockEvent,
  getMockInsights,
  getUpdatedData,
} from './mock';

/**
 * Registro de adapters.
 *
 * `config.data.adapter` existia no JSON e era ignorado — o DataProvider
 * importava `mock` estaticamente. Trocar de fonte de dados exigia editar
 * código, não configuração, o que contradiz a premissa do produto de ser
 * verticalizável por config.
 *
 * Um adapter expõe: snapshot(), table(), insights(), event(), update(prev).
 * Novos adapters (rest, websocket, notion) entram aqui sem tocar o provider.
 */
const mockAdapter = {
  name: 'mock',
  snapshot: async () => getMockData(),
  table: async () => getMockTable(),
  insights: async () => getMockInsights(),
  event: () => getMockEvent(),
  update: prev => getUpdatedData(prev),
};

const ADAPTERS = {
  mock: mockAdapter,
};

export function resolveAdapter(name = 'mock') {
  const adapter = ADAPTERS[name];
  if (!adapter) {
    throw new Error(
      `Adapter "${name}" não registrado. Disponíveis: ${Object.keys(ADAPTERS).join(', ')}.`
    );
  }
  return adapter;
}

export { ADAPTERS };
