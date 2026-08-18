# Orison Command Center

**Status: v1.1 — refatoração visual completa aplicada sobre a v1.0.**

## Stack
- Vite + **React 19** (a v1.0 documentava React 18; o `package.json` sempre fixou 19)
- CSS Modules com custom properties (tokens herdados do `orisonDesign.md`)
- Three.js via @react-three/fiber + @react-three/drei
- Zero Tailwind — tokens próprios

## Arquitetura
- Design Atômico: atoms → molecules → organisms → templates
- Configurável via JSON (`src/configs/`), **incluindo identidade visual** (bloco `theme`)
- Data layer via React Context (3 contextos) + adapters resolvidos por config
- Motion: tokens em CSS espelhados em `src/motion/constants.js`, com guarda de paridade

## Estrutura
- `src/tokens/` — colors, typography, spacing, layout, motion, dataviz
- `src/styles/primitives.module.css` — receitas compartilhadas (`composes:`)
- `src/theme/applyTheme.js` — aplica o bloco `theme` do config no `:root`
- `src/components/atoms|molecules|organisms|templates/`
- `src/heroes/` — objetos 3D + `palette.js` (fonte única de cor da camada 3D)
- `src/data/` — `DataProvider`, `contexts.js`, `format.js`, `adapters/`
- `src/motion/` — constants, `useCountUp`, `usePrefersReducedMotion`

## Contratos que não devem ser quebrados

**Tipografia**
- Piso absoluto de **10px**. Nada abaixo, nem glifo decorativo.
- Escala em `rem` com `html { font-size: 100% }`. **Nunca** aplicar `font-size`
  no `html` junto de uma escala em rem — o rem compõe sobre si mesmo e a escala
  inteira encolhe.
- Tracking em `em`, nunca em `px`.
- Valores numéricos usam o **sans** (Montserrat 500). Cormorant fica no
  wordmark, títulos de painel e camada editorial.

**Cor**
- `--color-crimson` é acento **estrutural**, nunca tinta de dado (2.1:1 sobre
  quase-preto). Marcas que codificam valor usam `--color-data-primary`
  (= `--dv-seq-4`, 4.6:1).
- Conteúdo não-textual exige 3:1; texto exige 4.5:1.
- A paleta de `src/tokens/dataviz.css` é validada por
  `validate_palette.js` (skill `dataviz`). Alterou? Revalide.
- A **ordem** dos slots categóricos é o mecanismo de segurança CVD.

**3D**
- `<Canvas>` sempre com `flat`. Sem isso o R3F aplica ACES tone mapping e a cor
  autorada em JS não bate com o mesmo token no CSS.
- Toda cor da camada 3D vem de `src/heroes/palette.js`.
- Animação multiplica por `delta`. Nunca cravar `0.016` como frame time.
- Geometria decorativa leva `raycast={() => null}`.
- `opacity` é uniform simples — **não** setar `material.needsUpdate` por frame.

**Motion e acessibilidade**
- `prefers-reduced-motion` tem alternativa intencional, não kill global:
  coreografia e loops somem, transições de estado sobrevivem comprimidas.
- A camada 3D lê a preferência via `usePrefersReducedMotion()`.
- Todo controle tem `:focus-visible` visível e alvo de toque ≥ 24px.
- Um `<h1>`, um `<main>`, `<aside>` nomeados, `lang="pt-BR"`.

**Resiliência**
- Heroes lazy ficam sob `ErrorBoundary`. Uma falha de chunk não pode apagar o app.
- Slots do rodapé têm classes explícitas — nunca seletores posicionais contra
  conteúdo condicional.
- Formatação de valor e data centralizada em `src/data/format.js`.
  Datas ISO usam `parseLocalDate` (`new Date('2026-06-15')` é meia-noite UTC e
  renderiza o dia anterior em todo o Brasil).

## Verificação

```bash
npm run lint     # deve ficar em 0
npm run build
node ~/.claude/skills/impeccable/scripts/detect.mjs --json src index.html
# paleta (skill dataviz):
node <dataviz>/scripts/validate_palette.js "<categórica>" --mode dark --surface "#0d0d0f"
node <dataviz>/scripts/validate_palette.js "<rampa>" --ordinal --mode dark --surface "#0d0d0f"
```

Achado aceito deliberadamente: o detector sinaliza **Montserrat** como fonte
saturada. É a voz técnica fixada da marca — registrado, não omitido.

## Heroes

Globe · NetworkGraph · ParticleStream · DataCube. Todos interativos: hover
**e clique** (o clique é o que torna o DetailPanel alcançável em touch).

## Roadmap

- Adapters reais: `rest.js`, `websocket.js`, `notion.js` — o registro em
  `src/data/adapters/index.js` já existe e é resolvido por config.
- i18n completo / RTL.
- Profiling em GPU integrada; fallback estático abaixo de 30fps.

## Documentos normativos
- `orisonDesign.md` — v1.1: escala tipográfica, paleta de dados validada, motion
- `orisonMotion.md` — animações dos heroes, loading, live-update
- `commandCenterMigration.md` — protocolo de migração por vertical

## Convenções
- Componentes PascalCase; CSS Modules camelCase no JS
- Um componente por pasta com `.jsx` + `.module.css`
- Receitas repetidas vão para `styles/primitives.module.css` via `composes:`
- Configs por vertical em `src/configs/{vertical-name}.json`
