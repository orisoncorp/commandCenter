# Orison Command Center

## Stack
- Vite + React 18
- CSS Modules com custom properties (tokens herdados do orisonDesign.md)
- Three.js via @react-three/fiber (Fase 3)
- Zero Tailwind — tokens próprios

## Arquitetura
- Design Atômico: atoms → molecules → organisms → templates
- Configurável via JSON (src/configs/)
- Data layer via React Context (DataProvider)
- Motion constants em src/motion/constants.js

## Estrutura
- src/tokens/ — CSS custom properties
- src/components/atoms/ — Badge, Label, Value, Delta, Dot, Timestamp
- src/components/molecules/ — KPI cards, charts (Fase 2)
- src/components/organisms/ — Panel, HeaderBar, BottomBar, HeroContainer
- src/components/templates/ — CommandCenter layout
- src/heroes/ — Objetos 3D (Fase 3)
- src/data/ — Adapters, DataProvider, transforms
- src/motion/ — Easing, durações, stagger utils
- src/configs/ — JSON configs por deploy

## Heroes (production-ready)
Quatro heroes implementados e prontos para uso em produção:
- **Globe** (`src/heroes/Globe/`) — esfera 3D georreferenciada; para verticais com dimensão geográfica
- **NetworkGraph** (`src/heroes/NetworkGraph/`) — hub radial com partículas bidirecionais; para conexões e plataformas B2B
- **ParticleStream** (`src/heroes/ParticleStream/`) — 6 ribbons com 480 partículas em fluxo; para volume e throughput
- **DataCube** (`src/heroes/DataCube/`) — cubos wireframe concêntricos; para análise multidimensional e BI

## Protocolo de Migração
`commandCenterMigration.md` — runbook executável para migrar o Command Center para qualquer vertical de cliente.
Contém: inventário de peças, árvores de decisão, input schema, runbook passo a passo, quality gates, anti-patterns e exemplo completo.
Este documento é a fonte primária para agentes Elpis de migração.

## Documentos normativos
- orisonDesign.md — cores, tipografia, espaçamento, componentes
- orisonMotion.md — easing, durações, animações, data viz specs
- commandCenterMigration.md — protocolo de migração por vertical

## Convenções
- Componentes: PascalCase (Badge.jsx)
- CSS Modules: camelCase no JS, kebab-case no CSS
- Tokens: --color-*, --motion-*, --space-*, --font-*, --dv-*
- Um componente por pasta com .jsx + .module.css
- Configs por vertical em src/configs/{vertical-name}.json
