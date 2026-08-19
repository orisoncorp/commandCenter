# Codex Project Instructions

Equivalente Codex do `CLAUDE.md`. Mantenha alinhado com a mesma intenção de
projeto, preferindo redação Codex-native e o estado atual do repositório.

## Commands

Convenção global RTK para shell, por exemplo `rtk npm run build`.

```bash
npm run dev
npm run lint      # baseline atual: 0 issues
npm run build
npm run preview
```

Para mudanças de código, rode `npm run lint` e `npm run build` salvo alteração
puramente documental.

## Stack

- Vite + **React 19** (versões em `package.json`).
- CSS Modules com custom properties herdadas do `orisonDesign.md`.
- Three.js via `@react-three/fiber` e `@react-three/drei`.
- Sem Tailwind; use o sistema de tokens local.

## Architecture

- Atomic Design: atoms -> molecules -> organisms -> templates.
- Configuração em `src/configs/`, incluindo o bloco `theme` (identidade visual).
- Dados via `src/data/DataProvider.jsx` + `contexts.js` + `adapters/` resolvidos
  por `config.data.adapter`.
- Tokens em `src/tokens/`; receitas compartilhadas em
  `src/styles/primitives.module.css` (use `composes:`, não copie o bloco).
- Motion em `src/motion/`; `assertMotionParity()` guarda o espelho CSS/JS.

## Invariantes

Estes são contratos, não preferências:

- **Piso tipográfico de 10px.** Escala em `rem`; `html` fica em `font-size: 100%`.
  Nunca aplique `font-size` no `html` junto de uma escala em rem.
- **Valores numéricos usam o sans**; Cormorant fica na camada editorial.
- **`--color-crimson` nunca é tinta de dado** (2.1:1 sobre quase-preto). Use
  `--color-data-primary`. Não-texto exige 3:1, texto exige 4.5:1.
- **`<Canvas>` sempre com `flat`** — sem isso o ACES tone mapping do R3F
  descasa a cor 3D do token CSS.
- **Cor 3D só de `src/heroes/palette.js`.** Animação 3D multiplica por `delta`.
- **`prefers-reduced-motion`** tem alternativa intencional; a camada 3D lê via
  `usePrefersReducedMotion()`.
- **Heroes lazy ficam sob `ErrorBoundary`.**
- **Datas ISO passam por `parseLocalDate`** — `new Date('2026-06-15')` é
  meia-noite UTC e renderiza um dia antes em UTC-3.
- Slots de layout usam classes explícitas, nunca `:nth-child` contra conteúdo
  condicional.

## Verificação de design

```bash
node ~/.claude/skills/impeccable/scripts/detect.mjs --json src index.html
```

Alterou `src/tokens/dataviz.css`? Revalide com `validate_palette.js` da skill
`dataviz` (`--ordinal` para rampas). Achado aceito: Montserrat é sinalizada
como fonte saturada e permanece por decisão de marca.

## Heroes

Quatro sistemas em `src/heroes/`: `Globe`, `NetworkGraph`, `ParticleStream`,
`DataCube`. Preserve hover **e clique** (o clique é o caminho de touch), os
detail panels, o opt-out de raycast na geometria decorativa e a ausência de
`material.needsUpdate` nos loops de frame.

## Migration Protocol

`commandCenterMigration.md` é o runbook de adaptação por vertical. O bloco
`theme` do config é onde a marca do cliente entra.

## Conventions

- Componentes PascalCase, por exemplo `Badge.jsx`.
- CSS Modules camelCase no JS, kebab-case no CSS.
- Tokens: `--color-*`, `--motion-*`, `--space-*`, `--font-*`, `--dv-*`, `--size-*`.
- Configs por vertical em `src/configs/{vertical-name}.json`.
- Prefira config/adapters a valores cravados por cliente.
