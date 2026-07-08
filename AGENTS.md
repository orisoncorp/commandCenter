# Codex Project Instructions

This is the Codex equivalent of `CLAUDE.md`. Keep it aligned with the same
project intent, but prefer Codex-native wording and the current repository state
when package metadata or files have drifted.

## Commands

Use the global RTK convention for shell commands, for example `rtk npm run build`.

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

For code changes, run `npm run lint` and `npm run build` unless the change is
pure documentation.

## Stack

- Vite + React, with dependency versions defined by `package.json`.
- CSS Modules with custom properties inherited from `orisonDesign.md`.
- Three.js via `@react-three/fiber` and `@react-three/drei`.
- No Tailwind; use the local token system.

## Architecture

- Atomic Design: atoms -> molecules -> organisms -> templates.
- Configuration lives in JSON files under `src/configs/`.
- Data flows through `src/data/DataProvider.jsx`, transform helpers, and
  interchangeable adapters.
- Motion constants and hooks live in `src/motion/`.
- Token files live in `src/tokens/`; global app styles live in `src/styles/`.

## Component Structure

- `src/components/atoms/`: Badge, Label, Value, Delta, Dot, Timestamp.
- `src/components/molecules/`: KPI, chart, table, feed, and insight primitives.
- `src/components/organisms/`: Panel, HeaderBar, BottomBar, HeroContainer,
  HeroToggle.
- `src/components/templates/CommandCenter/`: root application layout.
- Create one component per folder with `.jsx` plus `.module.css`, matching the
  existing local pattern.

## Heroes

Four production-ready hero systems live under `src/heroes/`:

- `Globe`: georeferenced 3D sphere with pins, radar sweep, and connection lines.
- `NetworkGraph`: radial hub with satellites and animated edge particles.
- `ParticleStream`: ribbon/particle throughput visualization.
- `DataCube`: multidimensional wireframe cube visualization.

All heroes are interactive. Preserve hover behavior, detail panels, and
performance considerations when editing them.

## Visual System

- Preserve the unified dark glass material across header, panels, and bottom
  bar.
- KPI cards intentionally avoid individual borders; use subtle separators and
  spacing.
- Background atmosphere, detail panel glass, and coordinated loading sequence
  are part of the v1 visual contract.
- `orisonDesign.md`, `orisonMotion.md`, and `commandCenterMigration.md` are the
  normative docs for visual, motion, and migration behavior.

## Migration Protocol

`commandCenterMigration.md` is the executable runbook for adapting the Command
Center to a client vertical. It covers inventory, decision trees, input schema,
quality gates, anti-patterns, and examples. Treat it as the source for migration
agents and verticalization work.

## Conventions

- Components: PascalCase, for example `Badge.jsx`.
- CSS Modules: camelCase from JavaScript, kebab-case inside CSS selectors.
- Tokens: `--color-*`, `--motion-*`, `--space-*`, `--font-*`, `--dv-*`.
- Vertical configs: `src/configs/{vertical-name}.json`.
- Prefer config/data adapters over hardcoded client-specific values.
