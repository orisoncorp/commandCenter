# Orison Command Center

**Status: v1.0 — validado, pronto para deploy (demo / piloto / uso interno)**

## Stack
- Vite + React 18
- CSS Modules com custom properties (tokens herdados do orisonDesign.md)
- Three.js via @react-three/fiber + @react-three/drei
- Zero Tailwind — tokens próprios

## Arquitetura
- Design Atômico: atoms → molecules → organisms → templates
- Configurável via JSON (src/configs/)
- Data layer via React Context (DataProvider) + adapters intercambiáveis
- Motion constants em src/motion/constants.js

## Estrutura
- src/tokens/ — CSS custom properties
- src/components/atoms/ — Badge, Label, Value, Delta, Dot, Timestamp
- src/components/molecules/ — KpiSimple, KpiSpark, KpiRing, KpiMetric, ChartBar, DataTable, EventFeed, InsightCard
- src/components/organisms/ — Panel, HeaderBar, BottomBar, HeroContainer, HeroToggle
- src/components/templates/ — CommandCenter (layout raiz)
- src/heroes/ — Objetos 3D
- src/data/ — Adapters, DataProvider, transforms
- src/motion/ — Easing, durações, stagger utils, useCountUp
- src/configs/ — JSON configs por deploy

## Heroes (production-ready)

Quatro heroes validados em produção:

- **Globe** (`src/heroes/Globe/`) — esfera 3D georreferenciada com pins de contrato, radar sweep crimson, connection lines entre nós ativos. Para verticais com dimensão geográfica: filiais, logística, cobertura regional.
- **NetworkGraph** (`src/heroes/NetworkGraph/`) — hub radial com nó central + satélites, partículas bidirecionais animadas nas edges. Para verticais de conexão: SaaS B2B, integrações, ecossistema de parceiros.
- **ParticleStream** (`src/heroes/ParticleStream/`) — Rio de Fitas: 6 ribbons com 480 partículas em fluxo contínuo, intensity wave que pulsa com volume. Para verticais de throughput: e-commerce, meios de pagamento, pipelines de dados.
- **DataCube** (`src/heroes/DataCube/`) — 2 cubos wireframe concêntricos com rotações independentes e efeito parallax no hover, partícula cruzando camadas. Para verticais de análise multidimensional: BI, controladoria, performance estratégica.

Todos os heroes são interativos: hover em entidades pausa rotação e abre o DetailPanel.

## Layout Visual (v1.0)

Integração visual completa validada:

- **Material unificado:** header, painéis laterais e bottom bar compartilham o mesmo sistema de vidro escurecido — fundo translúcido (`glass-surface` / `glass-header`), `backdrop-filter: blur(10-12px)`, sem bordas rígidas. Fades de gradiente nos limites entre painel e hero (64px).
- **Cards sem bordas:** KPI cards não têm `border` individual — separados por linha sutil `rgba(255,255,255,0.04)` e espaçamento generoso. Hover com `rgba(255,255,255,0.02)`.
- **Background atmosférico:** gradiente radial multicamada centrado no hero (núcleo crimson tênue → midnight → black), campo de 20 pontos estáticos ("star field", opacity 0.015–0.025), vignette em 4 cantos via `::after`.
- **DetailPanel glass-morphism:** fundo `glass-detail` (opacity 0.92) + `blur(16px)`, borda crimson tênue (`rgba 0.15`), box-shadow multicamada. Sem aspecto de modal.
- **Loading coordenado:** root fade-in 600ms → header slide-down 500ms → items de painel stagger 80–330ms → bottom slide-up 500ms com delay 100ms.

## Protocolo de Migração

`commandCenterMigration.md` — runbook executável para migrar o Command Center para qualquer vertical de cliente.

Contém: inventário de peças, árvores de decisão, input schema, runbook passo a passo (8 etapas), quality gates, anti-patterns e exemplo completo (E-commerce de Médio Porte).

Este documento é a fonte primária para agentes Elpis de migração.

## Roadmap (produção real)

Não bloqueantes para demo/piloto, necessários para operação contínua:

- **Adapters reais:** rest.js, websocket.js, notion.js (atualmente só mock.js)
- **Responsividade ampla:** breakpoints abaixo de 900px para tablet/mobile
- **Error states:** adapter failure, data stale, connection lost
- **Performance em hardware fraco:** profiling Three.js em GPUs integradas; fallback estático se FPS < 30

## Documentos normativos
- `orisonDesign.md` — cores, tipografia, espaçamento, tokens glass, padrão de cards sem bordas
- `orisonMotion.md` — easing, durações, animações dos heroes, live-update fade-swap, loading coordenado
- `commandCenterMigration.md` — protocolo de migração por vertical

## Convenções
- Componentes: PascalCase (Badge.jsx)
- CSS Modules: camelCase no JS, kebab-case no CSS
- Tokens: --color-*, --motion-*, --space-*, --font-*, --dv-*
- Um componente por pasta com .jsx + .module.css
- Configs por vertical em src/configs/{vertical-name}.json
