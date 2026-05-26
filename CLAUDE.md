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

## Documentos normativos
- orisonDesign.md — cores, tipografia, espaçamento, componentes
- orisonMotion.md — easing, durações, animações, data viz specs

## Convenções
- Componentes: PascalCase (Badge.jsx)
- CSS Modules: camelCase no JS, kebab-case no CSS
- Tokens: --color-*, --motion-*, --space-*, --font-*, --dv-*
- Um componente por pasta com .jsx + .module.css
