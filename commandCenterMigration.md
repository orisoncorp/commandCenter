---
version: "1.0"
name: Command Center Migration Protocol
description: >
  Runbook executável por agente para migrar o Command Center Orison para qualquer
  vertical de cliente. Inventário de peças reais, árvores de decisão, input schema,
  quality gates e exemplo completo de migração.

# ─────────────────────────────────────────────
# INVENTÁRIO DE PEÇAS — o que existe no repo
# ─────────────────────────────────────────────

heroes:
  globe:
    internal-name: "Globe"
    file: "src/heroes/Globe/Globe.jsx"
    visual-concept: "Esfera 3D com pontos georreferenciados, radar sweep e linhas de conexão"
    family: "geographic"
    symbolizes: "Operações distribuídas no espaço físico"
    data-shape: "Entidades com lat/lng; conectadas a registros da data-table por campo 'empresa'"
    use-when: "Vertical tem dimensão geográfica — filiais, cobertura territorial, logística, franquias"
    avoid-when: "Dados não têm componente espacial; relações hierárquicas ou fluxos abstratos"
    interactive: "Hover em DataPoint pausa rotação e abre DetailPanel com dados do contrato"
    realtime: "Novo evento → pulso no ponto correspondente via useStream"
    verticals: ["logística", "varejo multiunidade", "franquias", "cobertura regional", "operações B2B com múltiplas praças"]
    status: "production-ready"

  network:
    internal-name: "NetworkGraph"
    file: "src/heroes/NetworkGraph/NetworkGraph.jsx"
    visual-concept: "Hub radial 3D — nó central (sistema) + satélites (entidades) com partículas bidirecionais nas arestas"
    family: "connections"
    symbolizes: "Conexões entre entidades, fluxo de dados, relacionamentos hub-spoke"
    data-shape: "Entidades mapeadas em nós satélite; hub é sempre o 'sistema core' (sem contrato)"
    use-when: "Vertical é sobre conexões, integrações, ecossistema de parceiros, data flows entre sistemas"
    avoid-when: "Entidades são independentes entre si; dimensão geográfica é mais relevante"
    interactive: "Hover em nó pausa rotação e abre DetailPanel; tamanho do nó proporcional ao MRR"
    realtime: "Tamanho do nó atualiza proporcionalmente ao MRR vindo da tabela"
    verticals: ["SaaS B2B", "integrações", "ecossistema de parceiros", "monitoramento de sistemas", "plataformas de API"]
    status: "production-ready"

  particles:
    internal-name: "ParticleStream"
    file: "src/heroes/ParticleStream/ParticleStream.jsx"
    visual-concept: "6 ribbons horizontais com 480 partículas em fluxo — offwhite base, crimson acento (~9%); intensity wave periódica"
    family: "flow"
    symbolizes: "Volume de processamento, throughput, fluxo de operações em andamento"
    data-shape: "Entidades como âncoras em posições fixas nos ribbons; partículas fluem ao redor delas"
    use-when: "Vertical é sobre volume de transações, processamento, pipeline de dados, operações contínuas"
    avoid-when: "Hierarquia ou localização geográfica são mais importantes que volume/fluxo"
    interactive: "Hover em âncora ilumina partículas crimson próximas; sem pausa de rotação (câmera livre)"
    realtime: "Posições das âncoras refletem dados da tabela em tempo real"
    verticals: ["e-commerce", "meios de pagamento", "pipelines de dados", "automação de processos", "operações de alto volume"]
    status: "production-ready"

  cube:
    internal-name: "DataCube"
    file: "src/heroes/DataCube/DataCube.jsx"
    visual-concept: "2 cubos wireframe concêntricos com rotações independentes — outer (offwhite) + core (crimson); partícula cross-layer"
    family: "multidimensional"
    symbolizes: "Análise multidimensional, dados com múltiplos eixos de variação, BI e análise estratégica"
    data-shape: "Entidades posicionadas nos vértices dos cubos (5 âncoras distribuídas entre outer e core)"
    use-when: "Vertical é sobre análise, BI, dados com 3+ dimensões simultâneas, comparação estratégica"
    avoid-when: "Fluxo, localização ou conexões são o conceito principal"
    interactive: "Hover pausa rotação e abre DetailPanel; raio do ponto reflete hierarquia (core > outer)"
    realtime: "Âncoras refletem dados da tabela em tempo real"
    verticals: ["consultoria estratégica", "BI empresarial", "análise de performance", "controladoria", "planejamento financeiro"]
    status: "production-ready"

heroes-planned:
  molecular:
    description: "Clusters com força de ligação variável — composição, dependências, hierarquia"
    status: "not-built"
  network-mesh:
    description: "Rede mesh sem hub central — conexões peer-to-peer"
    status: "not-built"
  heatmap:
    description: "Grid 2D de calor — intensidade por célula"
    status: "not-built"
  timeline:
    description: "Linha temporal 3D — eventos no eixo do tempo"
    status: "not-built"
  treemap:
    description: "Hierarquia de blocos 3D — proporção e aninhamento"
    status: "not-built"

widgets:
  kpi-simple:
    file: "src/components/molecules/KpiSimple/KpiSimple.jsx"
    type: "metric-single"
    description: "Label + valor grande (display-md) + delta badge"
    data-shape: "{ value: number, delta: number, label: string }"
    props: "label, value, delta, format='number', formatFn"
    formats: "number (padrão), currency, percent, integer"
    animation: "count-up no mount (900ms); fade-swap em live updates (120ms→200ms)"
    use-when: "Métrica única com variação percentual; KPI primário de painel"
    avoid-when: "Precisa mostrar progresso relativo a uma meta (usar kpi-ring); precisa de histórico visual (usar kpi-spark)"
    panel-fit: "left | right"
    status: "production-ready"

  kpi-spark:
    file: "src/components/molecules/KpiSpark/KpiSpark.jsx"
    type: "metric-trend"
    description: "Label + valor + sparkline (SVG 200×48) + delta badge"
    data-shape: "{ value: number, delta: number, label: string, sparkline: number[] }"
    props: "label, value, delta, sparkline=[], format='percent'"
    animation: "count-up no mount; sparkline se desenha via stroke-dashoffset (400ms)"
    use-when: "Métrica com histórico de série temporal; tendência é tão importante quanto o valor atual"
    avoid-when: "Não há série temporal disponível; espaço é escasso"
    panel-fit: "left | right"
    status: "production-ready"

  kpi-ring:
    file: "src/components/molecules/KpiRing/KpiRing.jsx"
    type: "metric-progress"
    description: "Label + anel SVG de progresso + percentual central"
    data-shape: "{ value: number, target: number, label: string }"
    props: "label, value, target=100"
    animation: "stroke-dasharray anima via CSS transition (600ms)"
    use-when: "Métrica de progresso relativo a uma meta (ex: meta mensal, capacidade utilizada)"
    avoid-when: "Não há meta definida; tendência histórica é mais relevante que % de meta"
    panel-fit: "left | right"
    status: "production-ready"

  kpi-metric:
    file: "src/components/molecules/KpiMetric/KpiMetric.jsx"
    type: "metric-compare"
    description: "Label + valor principal + comparação vs período anterior + delta badge"
    data-shape: "{ value: number, compare: number, delta: number, label: string }"
    props: "label, value, compare, delta, format='currency'"
    animation: "count-up no mount; fade-swap em live updates"
    use-when: "Comparação explícita entre período atual e anterior; ticket médio, receita por categoria"
    avoid-when: "Comparação com meta (usar kpi-ring); sem período anterior para comparar"
    panel-fit: "left | right"
    status: "production-ready"

  chart-bar:
    file: "src/components/molecules/ChartBar/ChartBar.jsx"
    type: "visualization-bar"
    description: "Bar chart SVG com até 3 séries, máximo 6 categorias"
    data-shape: "{ categories: string[], series: [{ name: string, values: number[] }] }"
    animation: "Barras crescem de scaleY(0) na origem; stagger 60ms"
    use-when: "Comparação entre categorias discretas; distribuição por canal, produto ou segmento"
    avoid-when: "Série temporal (preferir sparkline); mais de 6 categorias ou 3 séries"
    panel-fit: "right | bottom"
    constraints: "max-series: 3, max-categories: 6, crimson é sempre série primária"
    status: "production-ready"

  data-table:
    file: "src/components/molecules/DataTable/DataTable.jsx"
    type: "detail-list"
    description: "Tabela com cabeçalho em Label/micro, células tipadas, hover por linha"
    data-shape: "Array de objetos; columns define a ordem e rótulos"
    props: "data=[], columns=[]"
    cell-variants: "td-metric (monospace), td-positive, td-negative, td-muted"
    use-when: "Detalhe de entidades individuais com múltiplos campos; bottom bar principal"
    avoid-when: "Mais de ~8 colunas (sobrecarga horizontal); dado não tem estrutura tabular"
    panel-fit: "bottom"
    status: "production-ready"

  event-feed:
    file: "src/components/molecules/EventFeed/EventFeed.jsx"
    type: "realtime-stream"
    description: "Feed vertical de eventos em tempo real com tipo, empresa, valor e timestamp"
    data-shape: "{ type: string, empresa: string, value: number, timestamp: string }"
    animation: "Nova linha entra com enter-data (translateY 8px + opacity, 150ms); linha mais antiga sai com exit-fade"
    use-when: "Vertical tem fluxo contínuo de eventos distintos (contrato, alerta, upsell, churn); monitoramento operacional em tempo real"
    avoid-when: "Eventos são homogêneos ou sem valor semântico individual; dado estruturado é mais relevante"
    panel-fit: "bottom"
    status: "production-ready"

  insight-card:
    file: "src/components/molecules/InsightCard/InsightCard.jsx"
    type: "intelligence-output"
    description: "Card de insight com título, conteúdo de texto, tipo (auto/manual) e timestamp"
    data-shape: "{ title: string, content: string, type: 'auto'|'manual', timestamp: string }"
    use-when: "Vertical tem camada analítica ou recomendações geradas por agente (Elpis)"
    avoid-when: "Sem camada analítica; espaço de painel é escasso"
    panel-fit: "left | right (ocupa slot de KPI)"
    status: "production-ready"

adapters:
  mock:
    file: "src/data/adapters/mock.js"
    description: "Dados estáticos com variação aleatória de ±2% a cada intervalo"
    exports: "getMockData(), getMockInsights(), getMockTable(), getMockEvent(), getUpdatedData()"
    use-when: "Desenvolvimento, demonstração, piloto sem dados reais conectados"
    status: "production-ready"
  rest:
    description: "Adapter para REST API — polling por refreshInterval"
    status: "planned"
  websocket:
    description: "Adapter para WebSocket — streaming em tempo real"
    status: "planned"
  notion:
    description: "Adapter para Notion API — fonte de dados via MCP"
    status: "planned"

organisms:
  panel:
    file: "src/components/organisms/Panel/Panel.jsx"
    description: "Contêiner lateral com title e slot para widgets; opacity 0.85"
    panel-fit: "left | right"
  header-bar:
    file: "src/components/organisms/HeaderBar/HeaderBar.jsx"
    description: "Barra 48px — título, KPI stubs e timestamp"
  bottom-bar:
    file: "src/components/organisms/BottomBar/BottomBar.jsx"
    description: "Barra inferior 180-240px — data-table OU event-feed"
  hero-container:
    file: "src/components/organisms/HeroContainer/HeroContainer.jsx"
    description: "Wrapper do hero 3D com DetailPanel overlay e HeroToggle"
  hero-toggle:
    file: "src/components/organisms/HeroToggle/HeroToggle.jsx"
    description: "Seletor de hero (visível no dev/demo); remover em produção"

# ─────────────────────────────────────────────
# ÁRVORES DE DECISÃO
# ─────────────────────────────────────────────

decision-trees:
  hero-selection:
    - if: "Vertical tem dimensão geográfica explícita (filiais, cobertura, logística, rotas)"
      then: "globe"
      rationale: "Pontos no espaço físico são a metáfora mais direta; dados de lat/lng são requisito"
    - if: "Vertical é sobre conexões entre sistemas ou entidades (SaaS, integrações, APIs, parceiros)"
      then: "network"
      rationale: "Hub radial comunica 'central + satélites' — ideal para plataformas B2B com clientes conectados"
    - if: "Vertical é sobre volume de processamento, transações ou fluxo contínuo de operações"
      then: "particles"
      rationale: "Densidade e velocidade das partículas comunica throughput antes de qualquer número ser lido"
    - if: "Vertical é sobre análise multidimensional, BI, performance estratégica ou controladoria"
      then: "cube"
      rationale: "Cubos concêntricos comunicam camadas de análise — macro (outer) e granular (core)"
    - if: "Nenhuma das condições acima se aplica claramente"
      then: "network (default)"
      rationale: "NetworkGraph é o mais neutro visualmente — hub central funciona como metáfora genérica de sistema"

  panel-composition:
    principle: "Topo macro (KPIs de visão executiva), meio análise (charts/spark), base detalhe (tabelas/feed)"
    left-panel:
      slots: 3-4
      rule: "KPIs primários da vertical — métricas que definem sucesso (ex: MRR, conversão, churn)"
      widget-priority: ["kpi-simple", "kpi-spark", "kpi-ring", "insight-card (se insights habilitados)"]
    right-panel:
      slots: 3
      rule: "KPIs secundários ou analíticos — métricas de suporte e comparação"
      widget-priority: ["kpi-metric", "kpi-simple", "kpi-ring", "chart-bar"]
    bottom-bar:
      slots: 1
      rule: "Exatamente 1 elemento — tabela OU feed, nunca ambos"
      widget-priority:
        - if: "Entidades individuais são relevantes para monitoramento"
          then: "data-table"
        - if: "Fluxo de eventos em tempo real é o foco operacional"
          then: "event-feed"

  kpi-variant-selection:
    - if: "Métrica tem tendência histórica disponível"
      then: "kpi-spark"
    - if: "Métrica é relativa a uma meta ou limite"
      then: "kpi-ring"
    - if: "Métrica precisa ser comparada com período anterior"
      then: "kpi-metric"
    - else: "kpi-simple"

# ─────────────────────────────────────────────
# INPUT SCHEMA — questionário para migração
# ─────────────────────────────────────────────

input-schema:
  vertical-name:
    type: "string"
    description: "Nome da vertical ou cliente (ex: 'Logística Express', 'E-commerce Módulo B')"
    required: true

  central-concept:
    type: "enum"
    values: ["geographic", "connections", "flow", "multidimensional"]
    description: "Conceito central do negócio — determina o hero"
    required: true

  primary-metrics:
    type: "array"
    max-items: 3
    description: "Métricas mais importantes — vão para o left panel"
    each-item:
      name: "string (ex: 'Entregas no Prazo')"
      data-key: "string (chave no adapter, ex: 'deliveries_ontime')"
      format: "enum [number, currency, percent, integer]"
      has-sparkline: "boolean"
      has-target: "boolean"
      has-comparison: "boolean"
    required: true

  secondary-metrics:
    type: "array"
    max-items: 3
    description: "Métricas de suporte — vão para o right panel"
    each-item:
      name: "string"
      data-key: "string"
      format: "enum [number, currency, percent, integer]"
      has-sparkline: "boolean"
      has-target: "boolean"
      has-comparison: "boolean"
    required: true

  detail-data:
    type: "enum"
    values: ["table", "feed"]
    description: "Tipo de dado detalhado no bottom bar"
    required: true

  table-columns:
    type: "array"
    description: "Colunas da tabela (se detail-data=table)"
    max-items: 6
    required-if: "detail-data = table"

  event-types:
    type: "array"
    description: "Tipos de evento possíveis no feed (se detail-data=feed)"
    required-if: "detail-data = feed"

  data-source:
    type: "enum"
    values: ["mock", "rest", "websocket", "notion"]
    description: "Fonte de dados"
    required: true

  rest-endpoint:
    type: "string"
    description: "URL base da API (se data-source=rest)"
    required-if: "data-source = rest"

  refresh-interval:
    type: "number"
    unit: "ms"
    default: 3000
    description: "Intervalo de polling (mock e rest)"

  insights-enabled:
    type: "boolean"
    default: false
    description: "Se true, adiciona InsightCard no left panel (substitui 1 slot de KPI)"

  entities:
    type: "array"
    description: "Entidades que aparecem no hero 3D (máximo 5)"
    max-items: 5
    each-item:
      empresa: "string (nome visível no hero)"
      lat: "number (obrigatório se hero=globe)"
      lng: "number (obrigatório se hero=globe)"
    required: true

# ─────────────────────────────────────────────
# RUNBOOK PASSO A PASSO
# ─────────────────────────────────────────────

---

# Runbook de Migração

## Pré-requisitos

- Repositório clonado e rodando (`npm run dev` no diretório `orison-command-center/`)
- Input schema preenchido (ver seção acima)
- Dados de origem identificados (mock ou real)

---

## Passo 1 — Coletar Input

Preencher o input schema com os dados da vertical. Salvar como `migration-inputs/{vertical-name}.yaml`.

Checklist:
- [ ] `vertical-name` definido
- [ ] `central-concept` escolhido
- [ ] `primary-metrics` (1-3) com nome, data-key e format
- [ ] `secondary-metrics` (1-3) com nome, data-key e format
- [ ] `detail-data` escolhido (table ou feed)
- [ ] `data-source` escolhido
- [ ] `entities` listadas (máximo 5)

---

## Passo 2 — Selecionar Hero

Aplicar a árvore `hero-selection` ao `central-concept` do input:

| central-concept    | hero           |
|--------------------|----------------|
| geographic         | Globe          |
| connections        | NetworkGraph   |
| flow               | ParticleStream |
| multidimensional   | DataCube       |

**Ação:** Confirmar que as entidades do input têm os dados que o hero exige:
- `globe` → lat/lng obrigatórios em cada entidade
- `network` → campo `empresa` para matching com tabela
- `particles` → campo `empresa` para matching com tabela
- `cube` → campo `empresa` para matching com tabela

---

## Passo 3 — Compor Painéis

Mapear métricas do input para widgets:

**Left panel** (primary-metrics):
- Para cada métrica, aplicar a árvore `kpi-variant-selection`
- Se `insights-enabled = true`, adicionar InsightCard como último slot
- Máximo 3 KPIs + 1 InsightCard = 4 slots

**Right panel** (secondary-metrics):
- Para cada métrica, aplicar a árvore `kpi-variant-selection`
- Máximo 3 slots
- Se uma métrica for melhor como chart-bar, posicionar no slot 3 do right panel

**Resultado esperado:** objeto `panels` do config JSON com arrays `left` e `right`.

---

## Passo 4 — Configurar Bottom Bar

Baseado em `detail-data`:

- `table` → `{ "type": "data-table", "source": "TABLE_SOURCE_KEY", "columns": [...] }`
- `feed` → `{ "type": "event-feed", "source": "events" }`

Para a tabela, os `columns` são as chaves dos objetos retornados pelo adapter (máximo 6).

---

## Passo 5 — Configurar Adapter

### Mock (desenvolvimento)
- Editar `src/data/adapters/mock.js`
- Renomear chaves de `BASE_DATA` para as `data-key` definidas no input
- Ajustar `CONTRACTS_TABLE` com os campos e entidades da vertical
- Ajustar `EVENTS` para os `event-types` definidos no input

### REST (produção)
- Criar `src/data/adapters/rest.js` seguindo o mesmo contrato de exports de `mock.js`
- Registrar no `DataProvider.jsx` como opção de adapter

### Entities no Hero
- Localizar o array de posições no arquivo do hero selecionado (ex: `LOCATIONS` no Globe)
- Substituir pelas entidades do input, com lat/lng se hero=globe

---

## Passo 6 — Gerar Config JSON

Montar `src/configs/{vertical-name}.json` com a estrutura:

```json
{
  "title": "NOME DA VERTICAL",
  "hero": "globe | network | particles | cube",
  "panels": {
    "left": [
      { "type": "kpi-simple|kpi-spark|kpi-ring|kpi-metric", "source": "DATA_KEY", "label": "LABEL" },
      ...
    ],
    "right": [
      { "type": "kpi-simple|kpi-spark|kpi-ring|kpi-metric", "source": "DATA_KEY", "label": "LABEL" },
      ...
    ]
  },
  "bottom": {
    "type": "data-table | event-feed",
    "source": "SOURCE_KEY",
    "columns": ["col1", "col2", ...]
  },
  "header": {
    "kpis": ["KEY1", "KEY2"],
    "showTimestamp": true
  },
  "data": {
    "adapter": "mock | rest | websocket | notion",
    "refreshInterval": 3000
  }
}
```

**Ação:** Apontar `App.jsx` para o novo config (ou adicionar seleção de config por parâmetro de URL).

---

## Passo 7 — Validar contra Quality Gates

Antes de considerar a migração completa, verificar todos os critérios (ver seção Quality Gates abaixo).

Executar `npm run dev` e confirmar visualmente:
- [ ] Hero renderiza sem erro no console
- [ ] Dados aparecem nos KPIs (count-up no mount)
- [ ] Bottom bar renderiza corretamente
- [ ] Hover no hero abre DetailPanel com dados reais
- [ ] Atualização de dados ocorre no intervalo configurado

---

## Passo 8 — Deploy

1. `npm run build` — gera `dist/`
2. Servir `dist/` via servidor estático ou container
3. Confirmar que a variável de config aponta para o arquivo correto da vertical

Para múltiplos clientes no mesmo build, parametrizar via `?config=vertical-name` na URL e carregar o JSON correspondente dinamicamente.

# ─────────────────────────────────────────────
# QUALITY GATES
# ─────────────────────────────────────────────

quality-gates:
  max-widgets: 12
  max-kpis-per-panel: 3
  max-chart-series: 3
  max-chart-categories: 6
  max-entities-in-hero: 5
  max-table-columns: 6
  hero-must-use-real-data: true
  bottom-bar-single-element: true
  all-sources-exist-in-adapter: true
  config-validates-against-schema: true
  hero-data-shape-compatible: true
  no-duplicate-kpi-variants: true

quality-gate-checklist:
  - "[ ] Total de widgets (KPIs + charts) ≤ 12"
  - "[ ] Left panel ≤ 3 KPIs (+ 1 InsightCard opcional)"
  - "[ ] Right panel ≤ 3 widgets"
  - "[ ] chart-bar ≤ 3 séries e ≤ 6 categorias"
  - "[ ] Hero tem ≤ 5 entidades interativas"
  - "[ ] data-table tem ≤ 6 colunas"
  - "[ ] Hero=globe: todas as entidades têm lat/lng válidos"
  - "[ ] Todas as 'source' keys existem no adapter configurado"
  - "[ ] Bottom bar tem exatamente 1 elemento (table OU feed)"
  - "[ ] Nenhum KPI duplica a mesma métrica em formatos diferentes sem propósito"
  - "[ ] config JSON é válido e carrega sem erro no DataProvider"

# ─────────────────────────────────────────────
# ANTI-PATTERNS
# ─────────────────────────────────────────────

anti-patterns:
  - name: "Sobrecarga visual"
    description: "Mais de 12 widgets simultâneos — cada elemento adicional reduz a legibilidade de todos os outros"
    symptom: "Painéis lotados, eye tracking disperso, usuário não sabe onde focar"
    fix: "Cortar métricas secundárias; mover detalhe para bottom bar"

  - name: "Hero decorativo"
    description: "Hero 3D sem dados reais — pontos/nós sem conexão com a data-table"
    symptom: "Hero roda mas hover não mostra dados; entidades são fictícias ou hardcoded sem propósito"
    fix: "Garantir que cada entidade no hero mapeia para um registro real da tabela"

  - name: "Conceito de hero incompatível"
    description: "Usar globe para dados sem dimensão geográfica, ou particles para hierarquias estáticas"
    symptom: "Metáfora visual não comunica o negócio — usuário não intende por que vê uma esfera"
    fix: "Aplicar árvore hero-selection rigorosamente"

  - name: "KPIs redundantes"
    description: "Mesma métrica em formatos diferentes no mesmo layout (ex: kpi-simple MRR + kpi-spark MRR)"
    symptom: "Painéis com duplicação óbvia; usuário questiona qual valor é o correto"
    fix: "Uma métrica, um widget — escolher o formato mais informativo"

  - name: "Chart supersaturado"
    description: "Mais de 3 séries ou 6 categorias em um chart-bar"
    symptom: "Cores sem discriminabilidade; legenda impossível de ler"
    fix: "Agrupar as menores categorias em 'Outros' usando neutral-scale-5"

  - name: "Bottom bar duplo"
    description: "Colocar tabela e feed simultaneamente no bottom bar"
    symptom: "Bottom bar acima de 240px; comprime o hero verticalmente"
    fix: "Escolher exatamente 1 — tabela para detalhe estruturado, feed para operações em tempo real"

  - name: "Painel opaco ao hero"
    description: "Remover opacity: 0.85 dos painéis laterais"
    symptom: "Hero perde presença visual — painéis bloqueiam completamente o objeto 3D"
    fix: "Manter opacity 0.85 em Panel.module.css"

  - name: "Atualização excessiva"
    description: "refreshInterval < 1000ms com adapter mock ou REST"
    symptom: "Counter updates constantes criam ruído visual; CPU alta"
    fix: "Mínimo 2000ms para mock; WebSocket para streams reais que precisam de baixa latência"

# ─────────────────────────────────────────────
# EXEMPLO COMPLETO DE MIGRAÇÃO
# ─────────────────────────────────────────────

---

# Exemplo: E-commerce de Médio Porte

## Input Preenchido

```yaml
vertical-name: "ecommerce-medio-porte"
central-concept: "flow"

primary-metrics:
  - name: "GMV (Gross Merchandise Volume)"
    data-key: "gmv"
    format: "currency"
    has-sparkline: true
    has-target: false
    has-comparison: false

  - name: "Taxa de Conversão"
    data-key: "conversion_rate"
    format: "percent"
    has-sparkline: true
    has-target: false
    has-comparison: false

  - name: "Pedidos no Dia"
    data-key: "orders_today"
    format: "integer"
    has-sparkline: false
    has-target: true
    has-comparison: false

secondary-metrics:
  - name: "Ticket Médio"
    data-key: "avg_order_value"
    format: "currency"
    has-sparkline: false
    has-target: false
    has-comparison: true

  - name: "Taxa de Abandono"
    data-key: "cart_abandonment"
    format: "percent"
    has-sparkline: false
    has-target: false
    has-comparison: false

  - name: "NPS"
    data-key: "nps"
    format: "integer"
    has-sparkline: false
    has-target: true
    has-comparison: false

detail-data: "feed"
event-types: ["pedido", "devolucao", "abandono", "fraude", "pagamento"]

data-source: "mock"
refresh-interval: 2000
insights-enabled: true

entities:
  - empresa: "Canal Web"
    ribbonIdx: 1
  - empresa: "App Mobile"
    ribbonIdx: 3
  - empresa: "Marketplace"
    ribbonIdx: 0
  - empresa: "WhatsApp"
    ribbonIdx: 4
  - empresa: "PDV Físico"
    ribbonIdx: 2
```

## Decisões Tomadas

**Hero:** `central-concept = flow` → **ParticleStream**

Justificativa: E-commerce é sobre volume de transações em fluxo contínuo. As 5 entidades são os canais de venda — cada um ancorado em um ribbon. Partículas crimson representam pedidos ativos; offwhite representam sessões em andamento.

**Left Panel:**
- GMV → `kpi-spark` (has-sparkline = true) — série temporal é o KPI mais relevante
- Taxa de Conversão → `kpi-spark` (has-sparkline = true) — tendência crítica
- Pedidos no Dia → `kpi-ring` (has-target = true) — progresso vs meta diária
- InsightCard (insights-enabled = true)

**Right Panel:**
- Ticket Médio → `kpi-metric` (has-comparison = true) — comparação explícita vs período
- Taxa de Abandono → `kpi-simple` — métrica simples com delta
- NPS → `kpi-ring` (has-target = true, ex: meta NPS 80)

**Bottom Bar:** `event-feed` — fluxo de pedidos em tempo real é mais operacionalmente relevante do que uma tabela estática

**Adapter:** `mock` para piloto; migrar para `rest` quando API do e-commerce estiver pronta

## Config JSON Final

```json
{
  "title": "E-COMMERCE MONITOR",
  "hero": "particles",
  "panels": {
    "left": [
      { "type": "kpi-spark",   "source": "gmv",            "label": "GMV" },
      { "type": "kpi-spark",   "source": "conversion_rate", "label": "CONVERSÃO" },
      { "type": "kpi-ring",    "source": "orders_today",    "label": "PEDIDOS NO DIA" },
      { "type": "insight",     "index": 0 }
    ],
    "right": [
      { "type": "kpi-metric",  "source": "avg_order_value",  "label": "TICKET MÉDIO" },
      { "type": "kpi-simple",  "source": "cart_abandonment", "label": "ABANDONO" },
      { "type": "kpi-ring",    "source": "nps",              "label": "NPS" }
    ]
  },
  "bottom": {
    "type": "event-feed",
    "source": "events"
  },
  "header": {
    "kpis": ["gmv", "orders_today"],
    "showTimestamp": true
  },
  "data": {
    "adapter": "mock",
    "refreshInterval": 2000
  }
}
```

## Validação dos Quality Gates

| Gate | Status |
|------|--------|
| Total widgets ≤ 12 | ✓ 7 widgets |
| Left panel ≤ 3 KPIs + 1 InsightCard | ✓ 3 KPIs + 1 insight |
| Right panel ≤ 3 widgets | ✓ 3 widgets |
| chart-bar ≤ 3 séries e ≤ 6 categorias | ✓ Não usado |
| Hero ≤ 5 entidades | ✓ 5 canais |
| Hero usa dados reais | ✓ Entidades mapeadas para eventos do feed |
| Bottom bar = 1 elemento | ✓ Apenas event-feed |
| Todas as source keys existem no adapter | ✓ Verificar ao configurar mock.js |
| Nenhum KPI duplicado | ✓ Métricas distintas |

## Adaptações no mock.js para Esta Vertical

```javascript
const BASE_DATA = {
  gmv: { value: 284600, delta: 8.3, label: 'GMV', sparkline: [210, 225, 240, 260, 272, 280, 284.6] },
  conversion_rate: { value: 3.4, delta: 0.2, label: 'CONVERSÃO', sparkline: [2.8, 3.0, 3.1, 3.2, 3.3, 3.4, 3.4] },
  orders_today: { value: 847, target: 1000, label: 'PEDIDOS NO DIA' },
  avg_order_value: { value: 336, compare: 312, delta: 7.7, label: 'TICKET MÉDIO' },
  cart_abandonment: { value: 68.2, delta: -1.4, label: 'ABANDONO' },
  nps: { value: 74, target: 80, label: 'NPS' },
};
```

---

# Adicionando uma Peça Nova ao Inventário

Quando um novo hero ou widget for implementado, adicionar ao YAML de inventário neste documento:

1. Adicionar a entrada na seção `heroes:` ou `widgets:` com todos os campos obrigatórios
2. Se for hero: mover de `heroes-planned` para `heroes` e atualizar `status`
3. Atualizar a árvore `hero-selection` se o novo hero cobrir um caso novo
4. Atualizar a árvore `kpi-variant-selection` se for novo tipo de KPI

Campos obrigatórios para hero novo:
`internal-name, file, visual-concept, family, symbolizes, data-shape, use-when, avoid-when, interactive, realtime, verticals, status`

Campos obrigatórios para widget novo:
`file, type, description, data-shape, props, use-when, avoid-when, panel-fit, status`
