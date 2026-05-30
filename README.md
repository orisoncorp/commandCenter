# Orison Command Center

**v1.0 — validado. Pronto para demo, piloto e uso interno.**

Sistema de visualização operacional B2B — dashboard de alto impacto configurável por vertical de cliente. Dark, imersivo, identidade Orison. Um hero 3D central comunica a natureza do negócio antes de qualquer número ser lido. Tudo o mais é composição de peças plug-and-play orientada por um config JSON.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| UI | React 18 + Vite |
| Estilo | CSS Modules + custom properties (zero Tailwind) |
| 3D | Three.js via @react-three/fiber + @react-three/drei |
| Data | React Context (DataProvider) + adapters intercambiáveis |
| Design | Orison Brand System (orisonDesign.md + orisonMotion.md) |

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── atoms/          # Badge, Label, Delta, Dot, Timestamp
│   ├── molecules/      # KpiSimple, KpiSpark, KpiRing, KpiMetric,
│   │                   # ChartBar, DataTable, EventFeed, InsightCard
│   ├── organisms/      # Panel, HeaderBar, BottomBar, HeroContainer, HeroToggle
│   └── templates/      # CommandCenter (layout raiz)
├── heroes/
│   ├── Globe/          # Esfera 3D georreferenciada
│   ├── NetworkGraph/   # Hub radial com partículas
│   ├── ParticleStream/ # Ribbons de partículas em fluxo
│   ├── DataCube/       # Cubos wireframe concêntricos
│   └── shared/         # DetailPanel, InteractivePoint
├── data/
│   ├── adapters/       # mock.js (ready); rest, websocket, notion (roadmap)
│   ├── DataProvider.jsx
│   └── transforms.js
├── configs/            # JSON configs por vertical (ex: orison-internal.json)
├── motion/             # constants.js, useCountUp.js
└── tokens/             # CSS custom properties (colors, typography, spacing, motion, dataviz)
```

---

## Como Rodar

```bash
cd orison-command-center
npm install
npm run dev
# → http://localhost:5173
```

Build de produção:

```bash
npm run build
# output em dist/
```

---

## Os 4 Heroes

O hero ocupa o centro visual e comunica a natureza do negócio de forma imediata.

| Hero | Conceito Visual | Use quando |
|------|----------------|-----------|
| **Globe** | Esfera 3D georreferenciada — pins de contrato, radar sweep crimson, connection lines | Vertical tem dimensão geográfica: filiais, logística, cobertura regional |
| **NetworkGraph** | Hub Radial — nó central + satélites com partículas bidirecionais nas edges | Vertical é sobre conexões: SaaS B2B, integrações, ecossistema de parceiros |
| **ParticleStream** | Rio de Fitas — 6 ribbons, 480 partículas em fluxo contínuo com intensity wave | Vertical é sobre volume/throughput: e-commerce, pagamentos, pipelines |
| **DataCube** | 2 cubos wireframe concêntricos com rotações independentes, parallax e partícula cross-layer | Vertical é sobre análise multidimensional: BI, controladoria, performance estratégica |

Todos os heroes são interativos: hover em qualquer entidade pausa a rotação e abre um DetailPanel flutuante (glass-morphism) com dados em tempo real.

---

## Configuração por Vertical

Cada vertical é um JSON em `src/configs/`:

```json
{
  "title": "NOME DA VERTICAL",
  "hero": "globe | network | particles | cube",
  "panels": {
    "left": [
      { "type": "kpi-simple | kpi-spark | kpi-ring | kpi-metric", "source": "DATA_KEY", "label": "LABEL" }
    ],
    "right": [...]
  },
  "bottom": { "type": "data-table", "columns": ["col1", "col2"] },
  "header": { "kpis": ["KEY1", "KEY2"], "showTimestamp": true },
  "data": { "adapter": "mock | rest | websocket | notion", "refreshInterval": 3000 }
}
```

Ver `src/configs/orison-internal.json` como referência de deploy atual.

---

## Guia de Deploy por Vertical

**`commandCenterMigration.md`** — runbook executável completo para migrar o Command Center para qualquer cliente ou vertical.

Contém:
- Inventário de todas as peças com metadados de seleção (use-when, avoid-when, data-shape)
- Árvores de decisão: tipo de vertical → hero + composição de painéis
- Input schema: questionário que vira config JSON
- Runbook passo a passo (8 etapas)
- Quality gates e anti-patterns
- Exemplo completo de migração (E-commerce de Médio Porte)

Este documento é a fonte primária para agentes Elpis de migração.

---

## Design System

- `orisonDesign.md` — paleta, tipografia, espaçamento, tokens glass, padrão de cards sem bordas
- `orisonMotion.md` — easing, durações, animações dos heroes, live-update fade-swap, loading coordenado

Tokens disponíveis via CSS custom properties prefixadas: `--color-*`, `--font-*`, `--space-*`, `--motion-*`, `--dv-*`.

---

## Roadmap

Não bloqueantes para demo/piloto. Necessários antes de operação contínua com cliente:

- [ ] **Adapters reais** — `rest.js`, `websocket.js`, `notion.js` (hoje só `mock.js`)
- [ ] **Responsividade ampla** — breakpoints abaixo de 900px para tablet/mobile
- [ ] **Error states** — adapter failure, data stale, connection lost com UI adequada
- [ ] **Performance em hardware fraco** — profiling Three.js em GPUs integradas; fallback estático se FPS < 30
