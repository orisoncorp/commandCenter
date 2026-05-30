# Orison Command Center

Sistema de visualização operacional B2B — dashboard de alto impacto configurável por vertical de cliente.

## Overview

O Command Center é uma superfície de monitoramento executivo construída sobre peças plug-and-play: um hero 3D central que comunica a natureza do negócio antes de qualquer número ser lido, painéis laterais com KPIs configuráveis e uma barra inferior de detalhe.

Cada deploy é uma composição de peças existentes orientada por um config JSON — sem código novo para mudar de vertical.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| UI | React 18 + Vite |
| Estilo | CSS Modules + custom properties (zero Tailwind) |
| 3D | Three.js via @react-three/fiber + @react-three/drei |
| Data | React Context (DataProvider) + adapters intercambiáveis |
| Design | Orison Brand System (orisonDesign.md + orisonMotion.md) |

## Estrutura de Pastas

```
src/
├── components/
│   ├── atoms/          # Badge, Label, Value, Delta, Dot, Timestamp
│   ├── molecules/      # KpiSimple, KpiSpark, KpiRing, KpiMetric, ChartBar, DataTable, EventFeed, InsightCard
│   ├── organisms/      # Panel, HeaderBar, BottomBar, HeroContainer, HeroToggle
│   └── templates/      # CommandCenter (layout raiz)
├── heroes/
│   ├── Globe/          # Esfera 3D georreferenciada
│   ├── NetworkGraph/   # Hub radial com partículas
│   ├── ParticleStream/ # Ribbons de partículas em fluxo
│   └── DataCube/       # Cubos wireframe concêntricos
├── data/
│   ├── adapters/       # mock.js (production-ready); rest, websocket, notion (planned)
│   ├── DataProvider.jsx
│   └── transforms.js
├── configs/            # JSON configs por vertical (ex: orison-internal.json)
├── motion/             # constants.js, useCountUp.js
└── tokens/             # CSS custom properties (colors, typography, spacing, motion, dataviz)
```

## Como Rodar

```bash
cd orison-command-center
npm install
npm run dev
```

Abre em `http://localhost:5173` com hot reload.

Build de produção:
```bash
npm run build
# output em dist/
```

## Os 4 Heroes

O hero ocupa o centro visual e comunica a natureza do negócio de forma imediata.

| Hero | Conceito | Use quando |
|------|----------|-----------|
| **Globe** | Esfera 3D com pontos georreferenciados e radar sweep | Vertical tem dimensão geográfica — filiais, logística, cobertura |
| **NetworkGraph** | Hub radial — nó central + satélites com partículas bidirecionais | Vertical é sobre conexões — SaaS B2B, integrações, ecossistema de parceiros |
| **ParticleStream** | 6 ribbons com 480 partículas em fluxo contínuo | Vertical é sobre volume/throughput — e-commerce, meios de pagamento, pipelines |
| **DataCube** | Cubos wireframe concêntricos com rotações independentes | Vertical é sobre análise multidimensional — BI, controladoria, performance estratégica |

Todos os heroes são interativos: hover em qualquer entidade pausa a rotação e abre um painel de detalhe com dados em tempo real.

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
  "bottom": { "type": "data-table | event-feed", "source": "SOURCE_KEY", "columns": [...] },
  "header": { "kpis": ["KEY1", "KEY2"], "showTimestamp": true },
  "data": { "adapter": "mock | rest | websocket | notion", "refreshInterval": 3000 }
}
```

Ver `src/configs/orison-internal.json` como referência.

## Guia de Deploy por Vertical

**`commandCenterMigration.md`** — runbook executável completo para migrar o Command Center para qualquer cliente ou vertical.

Contém:
- Inventário de todas as peças com metadados de seleção (use-when, avoid-when, data-shape)
- Árvores de decisão: tipo de vertical → hero + composição de painéis
- Input schema: questionário que vira config JSON
- Runbook passo a passo (8 passos)
- Quality gates e anti-patterns
- Exemplo completo de migração (E-commerce de Médio Porte)

## Design System

- `orisonDesign.md` — paleta, tipografia, espaçamento, componentes, regras de cor
- `orisonMotion.md` — easing, durações, transforms, sequências de animação, governance

Tokens disponíveis via CSS custom properties prefixadas: `--color-*`, `--font-*`, `--space-*`, `--motion-*`, `--dv-*`.
