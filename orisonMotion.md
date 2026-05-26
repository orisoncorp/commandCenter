---
version: "1.0"
name: Orison Motion System
description: >
  Sistema universal de motion design da Orison. Documento normativo que governa
  todo comportamento cinético da identidade visual — de micro-interações em UI
  a sequências de apresentação client-facing. Complementar ao orisonDesign.md,
  referenciando seus tokens sem duplicá-los. Construído sobre princípios de
  Design Atômico: átomos, moléculas, organismos, templates e governance.

# ─────────────────────────────────────────────
# ÁTOMOS — Primitivos indivisíveis de movimento
# ─────────────────────────────────────────────

easing:
  # Entrada — começa contido, termina com autoridade
  enter: "cubic-bezier(0.25, 0.1, 0.25, 1.0)"
  # Saída — começa decisivo, desvanece com controle
  exit: "cubic-bezier(0.25, 0.1, 0.25, 1.0)"
  # Estado — mudanças internas, sem drama
  state: "cubic-bezier(0.4, 0.0, 0.2, 1.0)"
  # Enfase — spring controlado, reservado para alto impacto
  emphasis: "cubic-bezier(0.16, 1, 0.3, 1)"
  # Linear — progresso uniforme, barras e contadores
  linear: "linear"
  # Micro — feedback instantâneo, quase imperceptível
  micro: "cubic-bezier(0.0, 0.0, 0.2, 1.0)"

duration:
  # Escala completa de durações (ms)
  instant: 80
  fast: 150
  base: 250
  moderate: 400
  slow: 600
  dramatic: 900
  cinematic: 1400

transform:
  # translateY — escala vertical (px)
  translate-y-micro: 4
  translate-y-sm: 8
  translate-y-md: 16
  translate-y-base: 24
  translate-y-lg: 48
  translate-y-xl: 80
  # translateX — escala horizontal (px)
  translate-x-sm: 8
  translate-x-md: 16
  translate-x-base: 24
  translate-x-lg: 48
  translate-x-drawer: 240
  # scale — limites rígidos
  scale-min: 0.96
  scale-base: 1.0
  scale-max: 1.02
  scale-modal-backdrop: 0.98
  # rotate — uso excepcional
  rotate-max: 0
  # opacity — thresholds
  opacity-start: 0.0
  opacity-mid: 0.55
  opacity-end: 1.0
  opacity-disabled: 0.35
  opacity-overlay: 0.75

stagger:
  # Delay base entre elementos sequenciais (ms)
  base: 60
  # Delay para listas densas
  dense: 40
  # Delay para sequências dramáticas (apresentações)
  dramatic: 120
  # Multiplicador decrescente por item (previne acúmulo)
  decay-factor: 0.9
  # Máximo de itens que recebem stagger individual
  max-items: 8
  # Delay máximo acumulado (ms) — cap absoluto
  max-delay: 480

color-transition:
  # Curva usada em todas as transições de cor
  easing: "{easing.state}"
  # Duração padrão para mudança de cor
  duration: "{duration.fast}"
  # Cor nunca transiciona sozinha — sempre acompanha outro transform
  coupled: true

# ─────────────────────────────────────────────
# MOLÉCULAS — Combinações atômicas com propósito
# ─────────────────────────────────────────────

molecules:
  # ── Entrances ──
  enter-reveal:
    properties: "opacity, transform"
    from: "opacity: {transform.opacity-start}; translateY({transform.translate-y-base}px)"
    to: "opacity: {transform.opacity-end}; translateY(0)"
    duration: "{duration.slow}"
    easing: "{easing.enter}"
    context: "Scroll reveals, conteúdo de seção"

  enter-materialize:
    properties: "opacity, transform"
    from: "opacity: {transform.opacity-start}; scale({transform.scale-min})"
    to: "opacity: {transform.opacity-end}; scale({transform.scale-base})"
    duration: "{duration.moderate}"
    easing: "{easing.emphasis}"
    context: "Cards, painéis, elementos que surgem in-place"

  enter-slide-x:
    properties: "opacity, transform"
    from: "opacity: {transform.opacity-start}; translateX(-{transform.translate-x-base}px)"
    to: "opacity: {transform.opacity-end}; translateX(0)"
    duration: "{duration.slow}"
    easing: "{easing.enter}"
    context: "Sidebar, drawers, painéis laterais"

  enter-fade:
    properties: "opacity"
    from: "opacity: {transform.opacity-start}"
    to: "opacity: {transform.opacity-end}"
    duration: "{duration.base}"
    easing: "{easing.state}"
    context: "Tooltips, overlays, elementos sem deslocamento"

  enter-data:
    properties: "opacity, transform"
    from: "opacity: {transform.opacity-start}; translateY({transform.translate-y-sm}px)"
    to: "opacity: {transform.opacity-end}; translateY(0)"
    duration: "{duration.fast}"
    easing: "{easing.micro}"
    context: "Linhas de tabela, itens de lista, dados populando"

  # ── Exits ──
  exit-dismiss:
    properties: "opacity, transform"
    from: "opacity: {transform.opacity-end}; translateY(0)"
    to: "opacity: {transform.opacity-start}; translateY(-{transform.translate-y-sm}px)"
    duration: "{duration.fast}"
    easing: "{easing.exit}"
    exit-ratio: 0.7
    context: "Remoção de elementos, dismiss de notifications"

  exit-fade:
    properties: "opacity"
    from: "opacity: {transform.opacity-end}"
    to: "opacity: {transform.opacity-start}"
    duration: "{duration.fast}"
    easing: "{easing.state}"
    exit-ratio: 0.6
    context: "Saída de overlays, transições de página (camada antiga)"

  exit-slide-x:
    properties: "opacity, transform"
    from: "opacity: {transform.opacity-end}; translateX(0)"
    to: "opacity: {transform.opacity-start}; translateX(-{transform.translate-x-md}px)"
    duration: "{duration.base}"
    easing: "{easing.exit}"
    exit-ratio: 0.7
    context: "Fechamento de sidebar/drawer"

  # ── State Transitions ──
  state-hover-primary:
    properties: "background-color, transform"
    transform: "translateY(-1px)"
    duration: "{duration.fast}"
    easing: "{easing.state}"
    context: "Hover em botão primary — crimson → red + lift"

  state-hover-ghost:
    properties: "border-color, transform"
    transform: "translateY(-1px)"
    duration: "{duration.fast}"
    easing: "{easing.state}"
    context: "Hover em botão ghost — border gray → offwhite + lift"

  state-hover-surface:
    properties: "background-color"
    duration: "{duration.fast}"
    easing: "{easing.state}"
    context: "Hover em linhas de tabela, items de sidebar"

  state-focus:
    properties: "outline, outline-offset"
    duration: "{duration.instant}"
    easing: "{easing.micro}"
    context: "Focus ring — aparição imediata, sem translate"

  state-active:
    properties: "transform"
    transform: "translateY(0)"
    duration: "{duration.instant}"
    easing: "{easing.micro}"
    context: "Active/press — retorna ao plano base"

  state-disabled:
    properties: "opacity"
    to: "opacity: {transform.opacity-disabled}"
    duration: "{duration.base}"
    easing: "{easing.state}"
    context: "Elementos desabilitados — fade para opacidade reduzida"

  # ── Micro-interactions ──
  micro-toggle:
    properties: "transform, background-color"
    duration: "{duration.fast}"
    easing: "{easing.state}"
    context: "Toggle switches — deslize sem overshoot"

  micro-check:
    properties: "opacity, transform"
    from: "opacity: 0; scale(0.8)"
    to: "opacity: 1; scale(1)"
    duration: "{duration.fast}"
    easing: "{easing.micro}"
    context: "Checkmarks, ícones de confirmação — aparição precisa"

  micro-progress:
    properties: "width, numeric percent display"
    easing: "{easing.linear}"
    context: "Barras de progresso — crescimento linear uniforme com percentual destacado e reset manual"

  micro-counter:
    properties: "numeric value, trend indicator"
    duration: "{duration.dramatic}"
    easing: "{easing.state}"
    context: "Contagem numérica animada (KPIs, métricas) com indicador direcional de crescimento"

  micro-typewriter:
    properties: "text content, cursor visibility"
    cursor:
      width: "2px"
      color: "#8B1A1A"
      blink-rate: "530ms"
      blink-method: "JS setInterval (imune a CSS cascade)"
      fade-after: "500ms"
      fade-duration: "250ms"
      fade-easing: "{easing.state}"
    typing:
      display-delay: 55
      label-delay: 45
      kpi-delay: 55
      cli-delay: 25
      clear-ratio: 0.55
      random-delay: false
    rewrite-sequence:
      - "cursor aparece no final do texto existente (piscando)"
      - "pausa 300ms — sistema lê o texto antes de limpar"
      - "clear: caracteres removidos direita→esquerda (delay × clearRatio)"
      - "pausa 200ms — cursor pisca sozinho no vazio"
      - "type: caracteres adicionados esquerda→direita"
      - "cursor fade out 500ms+250ms (exceto CLI — permanece)"
    max-chars: 60
    contexts:
      - "Headlines display (Cormorant)"
      - "Labels uppercase (Montserrat)"
      - "KPI rewrite (valor atualizado)"
      - "Elpis CLI agent output"
    forbidden:
      - "Body text / parágrafos"
      - "Botões / labels de navegação"
      - "Texto que o usuário precisa ler imediatamente"
    implementation: "JavaScript puro — cursor via JS setInterval, não CSS @keyframes"

  # ── Loading States ──
  loading-skeleton:
    properties: "background-position"
    gradient: "linear-gradient(90deg, {colors.surface} 25%, {colors.midnight} 50%, {colors.surface} 75%)"
    duration: "{duration.cinematic}"
    easing: "{easing.linear}"
    iteration: "infinite"
    context: "Skeleton screens — shimmer controlado sobre superfícies"

  loading-pulse:
    properties: "opacity"
    from: "opacity: 0.4"
    to: "opacity: 1.0"
    duration: "{duration.slow}"
    easing: "{easing.state}"
    iteration: "infinite"
    direction: "alternate"
    context: "Pulse sutil em indicadores de processamento"

  loading-bar:
    properties: "width, opacity"
    easing: "{easing.state}"
    height: "2px"
    color: "{colors.crimson}"
    context: "Barra linear de progresso — crimson, topo da viewport"

# ─────────────────────────────────────────────
# ORGANISMOS — Sequências compostas e coreografia
# ─────────────────────────────────────────────

organisms:
  page-transition:
    exit-molecule: "{molecules.exit-fade}"
    enter-molecule: "{molecules.enter-reveal}"
    overlap: false
    gap: 50
    description: "Fade-out da página antiga, gap de 50ms, reveal da nova"

  modal-choreography:
    sequence:
      - layer: "overlay"
        molecule: "{molecules.enter-fade}"
        delay: 0
        overlay-color: "rgba(10, 10, 10, {transform.opacity-overlay})"
      - layer: "backdrop"
        properties: "transform, filter"
        to: "scale({transform.scale-modal-backdrop}) blur(2px)"
        duration: "{duration.moderate}"
        delay: 0
      - layer: "modal"
        molecule: "{molecules.enter-materialize}"
        delay: 100
    exit-order: "modal → overlay → backdrop"
    description: "Overlay + backdrop blur simultâneos, modal entra 100ms depois"

  scroll-reveal:
    molecule: "{molecules.enter-reveal}"
    trigger: "IntersectionObserver"
    threshold: 0.15
    stagger: "{stagger.base}"
    stagger-decay: "{stagger.decay-factor}"
    stagger-cap: "{stagger.max-items}"
    root-margin: "0px 0px -60px 0px"
    once: true
    description: "Reveal progressivo no scroll, trigga a 15% de visibilidade, executa uma vez"

  data-population:
    table-rows:
      molecule: "{molecules.enter-data}"
      stagger: "{stagger.dense}"
      stagger-cap: 12
      description: "Linhas de tabela aparecem em sequência densa"
    chart-bars:
      properties: "transform"
      from: "scaleY(0)"
      to: "scaleY(1)"
      origin: "bottom"
      duration: "{duration.moderate}"
      easing: "{easing.emphasis}"
      stagger: "{stagger.base}"
      description: "Barras crescem do eixo base, sem bounce"
    chart-line:
      properties: "stroke-dashoffset"
      duration: "{duration.dramatic}"
      easing: "{easing.enter}"
      description: "Linha se desenha progressivamente da esquerda para direita"
    kpi-counter:
      molecule: "{molecules.micro-counter}"
      description: "Valor numérico conta de 0 até o target"

  list-stagger:
    molecule: "{molecules.enter-reveal}"
    stagger: "{stagger.base}"
    decay: "{stagger.decay-factor}"
    cap: "{stagger.max-items}"
    translate-y: "{transform.translate-y-md}"
    description: "Cards/items revelam em sequência, stagger decrescente, cap em 8 itens"

  grid-stagger:
    molecule: "{molecules.enter-materialize}"
    stagger: "{stagger.base}"
    pattern: "row-first"
    cap: "{stagger.max-items}"
    description: "Grid popula por linha (esquerda→direita, topo→base)"

  navigation-switch:
    exit:
      properties: "background-color, color"
      duration: "{duration.fast}"
      easing: "{easing.state}"
    enter:
      properties: "background-color, color, border-left-color"
      duration: "{duration.fast}"
      easing: "{easing.state}"
      delay: 0
    indicator: false
    description: "Mudança de estado sem indicador deslizante — transição direta de cor"

  drawer-toggle:
    enter:
      molecule: "{molecules.enter-slide-x}"
      from-x: "-{transform.translate-x-drawer}px"
      duration: "{duration.slow}"
      easing: "{easing.emphasis}"
    exit:
      molecule: "{molecules.exit-slide-x}"
      to-x: "-{transform.translate-x-drawer}px"
      duration: "{duration.base}"
      easing: "{easing.exit}"
    overlay:
      molecule: "{molecules.enter-fade}"
    description: "Drawer 240px desliza com spring na entrada, saída mais rápida"

  logo-motion:
    concept: "Incisão"
    description: "A linha crimson existe primeiro. Os círculos se formam ao redor dela como consequência inevitável."
    variants:
      symbol:
        total-duration: 1600
        beats:
          - name: "incision"
            element: "crimson-line"
            technique: "scaleY(0) → scaleY(1)"
            transform-origin: "55px 55px (center)"
            duration: "{duration.instant}"
            easing: "{easing.micro}"
            start: 0
          - name: "pause"
            duration: 200
            start: 80
            function: "silêncio visual — observador registra a intenção"
          - name: "inner-circle"
            element: "circle-inner"
            technique: "stroke-dashoffset: 182.21 → 0"
            dasharray: 182.21
            duration: "{duration.dramatic}"
            easing: "{easing.enter}"
            start: 280
          - name: "outer-circle"
            element: "circle-outer"
            technique: "stroke-dashoffset: 289.03 → 0"
            dasharray: 289.03
            duration: "{duration.dramatic}"
            easing: "{easing.enter}"
            start: 480
            delay: 200
          - name: "settle"
            element: "crimson-line"
            technique: "opacity: 0.9 → 0.55 → 0.9"
            duration: 200
            easing: "{easing.state}"
            start: 1380
            type: "opacity-pulse-once"
      lockup-horizontal:
        total-duration: 2600
        extends: "symbol"
        additional-beats:
          - name: "divider"
            element: "vertical-bar-slate"
            technique: "opacity: 0 → 1"
            duration: "{duration.base}"
            easing: "{easing.state}"
            start: 1600
          - name: "wordmark"
            element: "orison-text"
            technique: "opacity: 0→1 + letter-spacing: 12px→6px"
            duration: "{duration.slow}"
            easing: "{easing.emphasis}"
            start: 1800
          - name: "subtitle"
            element: "ai-infrastructure-text"
            technique: "opacity: 0 → 1"
            duration: "{duration.moderate}"
            easing: "{easing.state}"
            start: 2200
      lockup-vertical:
        total-duration: 2500
        extends: "symbol"
        additional-beats:
          - name: "divider-h"
            element: "horizontal-rule-crimson"
            technique: "scaleX(0) → scaleX(1)"
            transform-origin: "center"
            duration: "{duration.base}"
            easing: "{easing.micro}"
            start: 1600
          - name: "wordmark"
            element: "orison-text-centered"
            technique: "opacity: 0→1 + letter-spacing: 14px→8px"
            duration: "{duration.slow}"
            easing: "{easing.emphasis}"
            start: 1850
    contexts:
      slide-cover: "Lockup completo, executa uma vez"
      proposal-cover: "Estático — layout sugere sequência congelada no Beat 4"
      site-header: "Símbolo isolado, primeiro load apenas"
      video: "Lockup completo × 1.4 multiplicador, Beat 0 estendido a 1s"
    accessibility:
      prefers-reduced-motion: "Estado final de todos os elementos em 0.01s — sem translate, sem stagger, sem contagem"
    implementation:
      svg-technique: "SVG inline (não <use>) para acesso individual a cada path"
      keyframes:
        - "logoIncision — scaleY da linha crimson"
        - "logoCircleDraw — stroke-dashoffset dos círculos"
        - "logoSettle — pulse de opacidade da linha"
        - "logoDividerFade — fade do divisor vertical"
        - "logoWordmark — opacity + letter-spacing (horizontal)"
        - "logoSubtitle — opacity fade do subtítulo"
        - "logoDividerScale — scaleX do divisor horizontal"
        - "logoWordmarkV — opacity + letter-spacing (vertical)"

  data-viz-charts:
    bar:
      properties: "transform: scaleY"
      from: "scaleY(0)"
      to: "scaleY(1)"
      origin: "bottom"
      duration: "{duration.moderate}"
      easing: "{easing.emphasis}"
      stagger: "{stagger.base}"
    line:
      properties: "stroke-dashoffset"
      duration: "{duration.dramatic}"
      easing: "{easing.enter}"
    donut:
      properties: "stroke-dashoffset"
      duration: "{duration.moderate}"
      easing: "{easing.emphasis}"
      stagger: "{stagger.base}"
      center-counter: "{molecules.micro-counter}"
    area:
      properties: "clip-path"
      duration: "{duration.dramatic}"
      easing: "{easing.enter}"

  data-viz-realtime:
    counter-update:
      duration: 300
      easing: "{easing.state}"
      debounce: 2000
    stream-pulse:
      properties: "transform: scale"
      from: "scale(1)"
      to: "scale(1.5)"
      duration: 300
      easing: "{easing.emphasis}"
    table-row-insert:
      molecule: "{molecules.enter-data}"
      stagger: "none (one row at a time)"
    alert-pulse:
      properties: "border-color"
      color: "{colors.crimson}"
      pulses: 2
      pulse-duration: 300
      then: "static crimson border"

  command-center:
    layout:
      header-height: "48px"
      hero-viewport: "50-60%"
      left-panel: "240-320px"
      right-panel: "240-320px"
      bottom-bar: "180-240px"
      max-widgets: 12
      panel-opacity: 0.85
    hero-3d:
      wireframe-color: "{colors.offwhite}"
      wireframe-opacity: 0.15
      highlight-color: "{colors.crimson}"
      highlight-opacity: 0.3
      rotation-speed: "0.002 rad/frame"
      rotation-axis: "Y"
      rotation-easing: "linear"
      background: "{colors.black}"
    types:
      - "globe (operações distribuídas)"
      - "network (conexões, data flows)"
      - "particles (processamento, throughput)"
      - "molecular (composição, dependencies)"
      - "cube (dados multidimensionais)"

# ─────────────────────────────────────────────
# TEMPLATES — Contextos de aplicação
# ─────────────────────────────────────────────

templates:
  elpis-cli:
    allowed-molecules:
      - "{molecules.loading-pulse}"
      - "{molecules.loading-bar}"
      - "{molecules.micro-progress}"
      - "{molecules.micro-counter}"
    max-duration: 400
    typewriter:
      char-delay: 20
      line-delay: 80
      easing: "linear"
    status-indicators:
      thinking: "pulse"
      processing: "bar"
      complete: "instant-appear"
      error: "instant-appear"
    constraints:
      - "Sem translateY/X — terminal é sequencial"
      - "Sem scale — não aplicável em text output"
      - "Durações reduzidas em 40% vs web"
      - "Feedback funcional, nunca decorativo"

  client-presentation:
    allowed-organisms:
      - "{organisms.scroll-reveal}"
      - "{organisms.list-stagger}"
      - "{organisms.data-population}"
    duration-multiplier: 1.4
    stagger-multiplier: 1.5
    slide-transition:
      exit: "{molecules.exit-fade}"
      enter: "{molecules.enter-reveal}"
      gap: 200
    title-reveal:
      molecule: "{molecules.enter-slide-x}"
      from-x: "-{transform.translate-x-md}px"
      duration: "{duration.slow}"
    eyebrow-reveal:
      properties: "opacity, letter-spacing"
      from: "opacity: 0; letter-spacing: 12px"
      to: "opacity: 1; letter-spacing: 5px"
      duration: "{duration.moderate}"
      delay: 200
    constraints:
      - "Máximo 3 elementos animando por slide"
      - "Sem loops de animação — tudo executa uma vez"
      - "Crimson como acento visual: barra lateral ou underline animados"

  landing-page:
    allowed-organisms:
      - "{organisms.scroll-reveal}"
      - "{organisms.list-stagger}"
      - "{organisms.grid-stagger}"
      - "{organisms.data-population}"
    hero-sequence:
      - step: "eyebrow"
        properties: "opacity"
        duration: "{duration.base}"
        delay: 200
      - step: "headline"
        molecule: "{molecules.enter-reveal}"
        translate-y: "{transform.translate-y-lg}"
        delay: 400
      - step: "subheadline"
        molecule: "{molecules.enter-fade}"
        delay: 700
      - step: "cta"
        molecule: "{molecules.enter-materialize}"
        delay: 1000
    constraints:
      - "Performance budget: apenas transform e opacity"
      - "Nenhuma animação acima de 1400ms"
      - "Scroll-reveals executam uma vez (IntersectionObserver unobserve)"

  dashboard:
    allowed-molecules:
      - "{molecules.enter-data}"
      - "{molecules.micro-counter}"
      - "{molecules.loading-skeleton}"
      - "{molecules.loading-bar}"
      - "{molecules.state-hover-surface}"
    max-stagger-items: 6
    constraints:
      - "Sem stagger em tabelas com mais de 20 linhas"
      - "Loading skeleton em vez de spinners"
      - "Updates de dados: transição numérica, sem re-render animado"
      - "Durações máximas de 400ms — funcionalidade sobre estética"

# ─────────────────────────────────────────────
# GOVERNANCE — Regras transversais
# ─────────────────────────────────────────────

governance:
  performance:
    target-fps: 60
    allowed-properties:
      - "transform"
      - "opacity"
      - "filter"
      - "clip-path"
      - "background-position"
      - "stroke-dashoffset"
    forbidden-properties:
      - "width"
      - "height"
      - "margin"
      - "padding"
      - "top"
      - "right"
      - "bottom"
      - "left"
      - "border-width"
      - "font-size"
    will-change: "Declarar apenas durante a animação, remover após"
    gpu-compositing: "transform e opacity são GPU-composited por padrão"

  accessibility:
    prefers-reduced-motion:
      durations: "0.01s"
      transforms: "none — remover todos os translate/scale"
      opacity: "mantida — informação, não decoração"
      stagger: "eliminado — todos os itens aparecem simultaneamente"
      loading: "skeleton shimmer reduzido a static placeholder"
      counter: "valor final instantâneo, sem contagem animada"

  composition:
    max-simultaneous-properties: 2
    forbidden-combinations:
      - "translateX + translateY + scale simultâneos"
      - "opacity + scale + translate nos três ao mesmo tempo"
    rule: "Máximo duas propriedades animando por elemento por transição"

  naming:
    pattern: "motion-[camada]-[tipo]-[variante]"
    layers:
      - "atom"
      - "mol"
      - "org"
      - "tpl"
    examples:
      - "motion-atom-easing-enter"
      - "motion-mol-enter-reveal"
      - "motion-org-scroll-reveal"
      - "motion-tpl-dashboard-loading"

  exit-ratio:
    default: 0.7
    rule: "Duração de saída = duração de entrada × exit-ratio"
    rationale: "Usuário já absorveu o conteúdo, saída não precisa do mesmo peso"

  crimson-motion:
    rule: "Crimson em motion segue a mesma disciplina do design: uma vez por tela"
    allowed-uses:
      - "Loading bar linear (topo)"
      - "Border-left accent animado (slide covers)"
      - "Focus ring em botão primary"
    forbidden-uses:
      - "Pulsação de fundo crimson"
      - "Glow ou sombra colorida animada"
      - "Partículas, trails ou efeitos de emissão"
---

# Orison Motion System

> **Documento normativo de motion design.** Todos os comportamentos cinéticos
> da Orison nascem aqui. Designers, desenvolvedores e agentes de IA devem
> consultar este arquivo como fonte única de verdade para easing, duração,
> transforms, sequências e coreografia. Complementar ao `orisonDesign.md` —
> referencia seus tokens sem duplicá-los.

---

## Overview

O motion design da Orison é a extensão cinética de uma identidade construída
sobre escuridão intencional, precisão tipográfica e um único acento cromático
usado com disciplina cirúrgica. Se o `orisonDesign.md` define *o que* a Orison
parece, este documento define *como* a Orison se move.

**Princípio fundacional:** A Orison se move como algo inevitável. Não há
hesitação, não há excesso, não há ornamento cinético. Cada frame serve a uma
função — comunicar estado, guiar atenção ou confirmar ação.

**Personalidade cinética:** Calculada. Precisa. Contida. Decisiva. O motion
da Orison nunca chama atenção para si mesmo. Ele opera em silêncio — o
observador sente o resultado sem perceber a causa.

**Resposta emocional esperada:** Ao interagir com um material da Orison, o
usuário deve sentir que o sistema responde com a mesma precisão com que opera.
Nunca lúdico, nunca errático, nunca ornamental.

**O que o motion da Orison nunca é:**
- Bouncy — sem overshoots visíveis, sem springs exagerados.
- Playful — sem wobbles, shakes, confetti ou celebrações animadas.
- Slow — sem transições que façam o usuário esperar sem propósito.
- Invisible — sem mudanças de estado instantâneas que confundam o tracking
  visual. O motion existe para guiar, não para desaparecer.

**Princípio unificador:** *Menos movimento, mais intenção.* O motion ganha
peso pela contenção — pelo que se escolhe não animar.

---

## Atoms — Easing

As curvas de easing definem a personalidade de cada movimento. Cada curva tem
um propósito semântico declarado — nunca use uma curva fora do seu contexto.

**Enter (`cubic-bezier(0.25, 0.1, 0.25, 1.0)`):**
Para elementos chegando à tela. Começa contido, ganha velocidade gradual e
termina com autoridade. Sem desaceleração abrupta — a chegada é suave mas
firme. Usado em scroll reveals, aparições de painéis e entradas de conteúdo.

**Exit (`cubic-bezier(0.25, 0.1, 0.25, 1.0)`):**
Para elementos deixando a tela. Começa decisivo e desvanece com controle.
A saída não é um desaparecimento — é uma retirada deliberada.

**State (`cubic-bezier(0.4, 0.0, 0.2, 1.0)`):**
Para mudanças internas em elementos já visíveis. Hover, focus, active, mudanças
de cor. A curva é funcional e discreta — sem drama, sem personalidade. Material
Design Standard Easing, testado em bilhões de interações.

**Emphasis (`cubic-bezier(0.16, 1, 0.3, 1)`):**
Spring controlado para momentos de alto impacto. Reservado para ações que
precisam comunicar peso: abertura de modais, materialização de cards
importantes, entrada de painéis com conteúdo crítico. Usar com a mesma
parcimônia do crimson — uma vez por contexto.

**Linear:**
Progresso uniforme sem aceleração. Exclusivo para barras de progresso,
shimmer de skeletons e contadores numéricos — situações onde a variação
de velocidade confundiria a percepção de progresso.

**Micro (`cubic-bezier(0.0, 0.0, 0.2, 1.0)`):**
Feedback instantâneo, quase imperceptível. Para estados active/press,
aparições de checkmarks e toggles. Deceleração terminal suave para não
parecer mecânico.

**Regras de easing:**
- Nunca use `ease-in` isolado — cria sensação de aceleração sem resolução.
- Nunca use `ease-in-out` — é genérico demais, sem personalidade.
- Nunca crie curvas de easing fora das seis definidas sem aprovação.
- Emphasis é o equivalente cinético do crimson: reservado para uma ocorrência
  por tela ou por fluxo.

---

## Atoms — Duration

A escala de duração define o tempo que cada tipo de interação consome. Cada
token tem um papel semântico rígido.

| Token        | Valor  | Contexto                                               |
|--------------|--------|---------------------------------------------------------|
| `instant`    | 80ms   | Feedback de press/active, focus ring, toggles           |
| `fast`       | 150ms  | Hover states, mudanças de cor, exits rápidos            |
| `base`       | 250ms  | Transições padrão de estado, fades, mudanças de página  |
| `moderate`   | 400ms  | Materialização de cards, abertura de overlays           |
| `slow`       | 600ms  | Scroll reveals, entradas de painéis, slides             |
| `dramatic`   | 900ms  | Desenho de linhas de chart, sequências de apresentação  |
| `cinematic`  | 1400ms | Shimmer de skeleton, hero sequences de landing page     |

**Exit ratio:** A duração de saída é sempre 70% da duração de entrada
correspondente. Saída = `duração × 0.7`. O usuário já absorveu o conteúdo;
a saída não precisa do mesmo peso temporal.

**Regras de duração:**
- Nenhuma animação de UI ultrapassa `slow` (600ms) — exceto loading states
  e contextos de apresentação.
- Em contexto de dashboard, o teto é `moderate` (400ms).
- Em contexto Elpis/CLI, o teto é `moderate` (400ms), com redução de 40%.
- Em contexto de apresentação, durações são multiplicadas por 1.4×.
- `cinematic` é exclusivo para sequências compostas — nunca para um elemento
  isolado.

---

## Atoms — Transform

Primitivos geométricos que o motion aplica aos elementos. Cada um tem valores
definidos e limites que não podem ser excedidos.

**TranslateY — escala vertical:**

| Token     | Valor | Uso                                                    |
|-----------|-------|--------------------------------------------------------|
| `micro`   | 4px   | Micro-feedbacks, hover lifts de ícones                 |
| `sm`      | 8px   | Dismiss de elements, exits sutis                       |
| `md`      | 16px  | Stagger reveals em listas, entradas de cards           |
| `base`    | 24px  | Scroll reveals de conteúdo — padrão                    |
| `lg`      | 48px  | Entrada de painéis grandes, hero content               |
| `xl`      | 80px  | Reservado para landing page hero sequences             |

**TranslateX — escala horizontal:**

| Token     | Valor  | Uso                                                   |
|-----------|--------|-------------------------------------------------------|
| `sm`      | 8px    | Micro-deslize em hover de items de lista               |
| `md`      | 16px   | Reveal lateral de títulos em apresentações             |
| `base`    | 24px   | Entradas laterais sutis                                |
| `lg`      | 48px   | Deslize de painéis secundários                         |
| `drawer`  | 240px  | Sidebar/drawer — corresponde à largura do sidebar      |

**Scale — limites rígidos:**

| Token             | Valor | Uso                                            |
|-------------------|-------|------------------------------------------------|
| `scale-min`       | 0.96  | Piso absoluto. Nunca escalar abaixo disso      |
| `scale-base`      | 1.0   | Estado normal                                  |
| `scale-max`       | 1.02  | Teto absoluto. Nunca escalar acima disso       |
| `modal-backdrop`  | 0.98  | Backdrop atrás de modais — compressão sutil    |

Scaling exagerado é antitético à identidade. A Orison não "cresce" nem
"encolhe" de forma perceptível — escala é sempre uma sugestão de profundidade,
nunca uma transformação óbvia.

**Rotate:**
Valor máximo: 0°. A linguagem de formas da Orison é ortogonal — austeridade
geométrica. Rotação não faz parte do vocabulário cinético. Exceção única:
ícones de loading que requerem spin (mas a Orison prefere barras lineares
e pulses a spinners rotativos).

**Opacity — thresholds:**

| Token       | Valor | Uso                                               |
|-------------|-------|----------------------------------------------------|
| `start`     | 0.0   | Ponto inicial de entrances                         |
| `mid`       | 0.55  | Overlay intermediário, text-dim equivalente         |
| `end`       | 1.0   | Estado final, opacidade plena                      |
| `disabled`  | 0.35  | Elementos desabilitados — consistente com UI       |
| `overlay`   | 0.75  | Overlay escuro atrás de modais                     |

**Regras de transform:**
- Nunca combine mais de dois transforms simultâneos por elemento.
- TranslateY + opacity é a combinação padrão para reveals.
- Scale + opacity é a combinação para materializações.
- TranslateX + opacity é a combinação para deslizes laterais.
- Nunca translateX + translateY + scale ao mesmo tempo.

---

## Atoms — Stagger

O stagger controla o timing entre elementos em sequência. Sem stagger, um
grupo de cards aparece como um bloco monolítico. Com stagger, cada elemento
anuncia sua presença individualmente — criando ritmo visual.

**Parâmetros:**

| Token         | Valor  | Uso                                                |
|---------------|--------|----------------------------------------------------|
| `base`        | 60ms   | Stagger padrão — cards, seções, itens de lista     |
| `dense`       | 40ms   | Listas densas — linhas de tabela, itens compactos  |
| `dramatic`    | 120ms  | Apresentações — cada elemento tem peso narrativo   |
| `decay-factor`| 0.9×   | Multiplicador decrescente por item                 |
| `max-items`   | 8      | Máximo de itens com stagger individual             |
| `max-delay`   | 480ms  | Delay acumulado máximo — cap absoluto              |

**Decay (decrescimento):**
O stagger da Orison é decrescente — cada item subsequente espera menos que o
anterior. Fórmula: `delay(n) = base × decay^(n-1)`.

Para `base: 60ms, decay: 0.9`:
- Item 1: 0ms
- Item 2: 60ms
- Item 3: 114ms (60 + 54)
- Item 4: 163ms (114 + 49)
- Item 5: 207ms (163 + 44)
- ...

Isso cria aceleração perceptual — o grupo ganha momentum, comunicando que o
sistema está "carregando" com eficiência crescente.

**Cap de itens:**
Após 8 itens, todos os restantes aparecem simultaneamente com o delay do
item 8. Isso previne que o último item de uma lista de 50 elementos apareça
segundos depois do primeiro.

**Regras de stagger:**
- Nunca use stagger sem decay — stagger linear cria monotonia.
- Nunca aplique stagger em listas com mais de 20 itens em contexto de
  dashboard — performance previne.
- Em contexto de apresentação, multiplique o stagger base por 1.5×.
- Stagger é eliminado quando `prefers-reduced-motion` está ativo.

---

## Atoms — Color Transition

Transições de cor seguem regras próprias porque cor carrega significado
semântico imediato — a mudança precisa ser legível mas não chamativa.

**Regra fundamental:** Cor nunca transiciona sozinha. Toda mudança de cor
acompanha ao menos um outro transform (translateY, opacity, border-color).
Cor isolada mudando parece um glitch, não uma transição intencional.

**Exceção:** Hover em superfícies de tabela (`rgba(255,255,255,0.02)`), onde
a mudança é tão sutil que funciona sozinha.

**Easing:** Sempre `state` — mudanças de cor não precisam de drama.

**Duração:** Sempre `fast` (150ms) — a nova cor precisa ser legível
rapidamente para comunicar o novo estado.

**Crimson transitions:** A transição crimson → red (hover de botão primary) é
a única transição de cor com significado de acento no sistema. Todas as outras
são neutras (backgrounds, borders, text colors).

---

## Molecules — Entrances

Moléculas de entrada são receitas completas de como um elemento aparece na
tela. Cada uma combina átomos específicos para um contexto declarado.

**Reveal (`enter-reveal`):**
O padrão de entrada mais comum da Orison. O elemento sobe de baixo (translateY
24px) enquanto ganha opacidade, com easing de entrada e duração slow (600ms).
Usado em scroll reveals e aparições de seções. Este é o equivalente cinético
do body text — o default, a voz base.

**Materialize (`enter-materialize`):**
O elemento surge in-place com scale sutil (0.96 → 1.0) e opacity. Usa easing
emphasis (spring controlado) e duração moderate (400ms). Reservado para
elementos que "aparecem" sem vir de uma direção — cards em grids, modais,
elementos de destaque. O spring controlado comunica presença e peso.

**Slide X (`enter-slide-x`):**
Entrada lateral com translateX e opacity. Duração slow (600ms), easing de
entrada. Para elementos com origem espacial definida — sidebar, drawers,
painéis que vêm de uma borda da tela. A direção (esquerda ou direita) depende
da posição do elemento.

**Fade (`enter-fade`):**
Apenas opacity, sem deslocamento. Duração base (250ms), easing state. Para
elementos que não precisam de presença espacial — tooltips, overlays, estados
transitórios. O mais discreto dos entrances.

**Data (`enter-data`):**
Entrada otimizada para dados tabulares. TranslateY curto (8px), opacity,
duração fast (150ms), easing micro. Projetada para executar em stagger denso
com dezenas de itens sem causar jank. A versão atlética do reveal — mesma
estrutura, execução compacta.

---

## Molecules — Exits

A saída de um elemento segue o princípio do exit-ratio: sempre mais rápida
que a entrada correspondente.

**Dismiss (`exit-dismiss`):**
O elemento sobe ligeiramente (-8px) e perde opacidade. Duração fast (150ms),
easing exit. Para remoção deliberada — notifications, toasts, itens deletados.
A direção para cima comunica que o elemento foi "dispensado", não que
desapareceu.

**Fade (`exit-fade`):**
Apenas opacity, sem deslocamento. Duração fast (150ms), easing state. Para
overlays, transições de página (camada antiga). O mais comum dos exits porque
a maioria dos contextos não precisa de direção na saída.

**Slide X (`exit-slide-x`):**
Saída lateral com translateX (-16px) e opacity. Duração base (250ms), easing
exit. Para sidebar e drawers fechando. A direção inverte a entrada.

**Regras de exit:**
- Nunca use a mesma duração de entrada para a saída — sempre aplique o
  exit-ratio (0.7×).
- Nunca faça exit com scale-down — escalar para baixo na saída parece "sugar"
  o elemento, criando sensação de erro.
- Se a entrada usou translate, a saída pode usar apenas opacity — a direção
  reversa nem sempre é necessária.

---

## Molecules — State Transitions

Mudanças de estado em componentes já visíveis. Cada componente do
`orisonDesign.md` tem suas transições mapeadas.

**Hover Primary (`state-hover-primary`):**
Background crimson → red + translateY(-1px). Duração fast, easing state. O
lift de 1px é sutil mas perceptível — comunica que o elemento é interativo sem
parecer bouncy.

**Hover Ghost (`state-hover-ghost`):**
Border gray → offwhite + translateY(-1px). Mesma estrutura do primary mas
aplicada à borda. O lift unifica a linguagem de hover entre os dois variantes.

**Hover Surface (`state-hover-surface`):**
Apenas background-color. Sem translate, sem scale. Duração fast, easing state.
Para linhas de tabela (`rgba(255,255,255,0.02)`) e items de sidebar
(`rgba(139,26,26,0.10)`). A mudança é quase subliminar.

**Focus (`state-focus`):**
Outline aparece com duração instant (80ms), easing micro. Sem translate — focus
é informação de acessibilidade, não decoração. O outline usa a cor do
componente (red para primary, offwhite para ghost).

**Active (`state-active`):**
TranslateY retorna a 0 com duração instant. O "press" do botão. A ausência
de bounce é intencional — o retorno é imediato e mecânico.

**Disabled (`state-disabled`):**
Opacity transiciona para 0.35 com duração base e easing state. A transição
é mais lenta que outros estados porque disabled geralmente é aplicado
programaticamente, não por interação do usuário.

---

## Molecules — Micro-interactions

Feedback tátil para ações instantâneas. A Orison trata micro-interactions como
confirmação mecânica — sem celebração, sem flourish.

**Toggle (`micro-toggle`):**
Deslize horizontal do indicador + mudança de cor. Duração fast, easing state.
O indicador move-se em linha reta, sem overshoot. O toggle é binário — a
transição reflete isso com linearidade.

**Check (`micro-check`):**
Checkmark aparece com scale(0.8 → 1.0) + opacity. Duração fast, easing micro.
O scale sutil dá a impressão de que o checkmark "se solidifica" em vez de
simplesmente aparecer.

**Progress (`micro-progress`):**
Barra cresce com width + easing linear. Progresso é a única situação onde
linear é obrigatório — qualquer curva distorceria a percepção de completude.
O percentual usa a mesma escala visual do counter (`32px`, monospace,
tabular-nums) para leitura imediata. O reset é manual e retorna barra,
percentual e botão ao estado inicial.

**Counter (`micro-counter`):**
Valor numérico anima de 0 ao target com duração dramatic e easing state. Para
KPIs e métricas. A contagem comunica magnitude — o usuário percebe se o número
é grande ou pequeno pela velocidade com que o counter se move. O counter pode
receber um indicador direcional discreto ao lado do número; na interface de
referência, o valor e a seta diagonal usam `positive-md`, sem moldura, com
micro-movimento ascendente para reforçar crescimento sem transformar a
micro-interaction em celebração.

**Typewriter (`micro-typewriter`):**
Texto escrito caractere por caractere com cursor vertical crimson (#8B1A1A)
pulsante. O cursor (2px largura × 1.1em altura) pisca via `setInterval` de
530ms — blink 100% JS, imune a CSS cascade. O blink é binário e mecânico:
`opacity: 1 → 0 → 1`, sem transição suave entre os estados.

**Delays por contexto** (configuráveis em 3 velocidades: slow/default/fast):
- Display (Cormorant): 55ms/char (slow: 80ms · fast: 30ms)
- Label (Montserrat): 45ms/char (slow: 70ms · fast: 25ms)
- KPI: 55ms/char (slow: 80ms · fast: 30ms)
- CLI/Elpis: 25ms/char (slow: 45ms · fast: 15ms) — agente processa mais rápido

**Clear ratio:** 0.55 — o clear é 55% da velocidade do typing (mais rápido,
porque o sistema apaga com eficiência, não com hesitação).

**Sequência de rewrite bidirecional** (quando há texto existente):
1. Cursor aparece ao final do texto (começa a piscar)
2. Pausa 300ms — o sistema "lê" antes de agir
3. Clear phase: caracteres removidos direita → esquerda a `delay × 0.55`
4. Pausa 200ms — cursor pisca sozinho no vazio
5. Type phase: caracteres adicionados esquerda → direita a `delay` atual
6. Cursor aguarda 500ms, depois fade out 250ms (`easing.state`)
7. No CLI: cursor permanece piscando como heartbeat do agente ativo

**Limite absoluto:** 60 caracteres. NUNCA em body text ou parágrafos —
o efeito perde todo o impacto em textos longos e torna-se ruído visual.
Reservado para headlines, labels, KPIs e output de agentes.

**Implementação:** JavaScript puro — cursor via `setInterval` com inline
styles (sem dependência de CSS), typing via `setInterval` com manipulação
direta de `textContent`. Zero CSS animations no efeito — apenas layout CSS.
Respeita `prefers-reduced-motion` e `.reduced-motion`: texto aparece
instantaneamente, cursor não é inserido.

---

## Molecules — Loading States

Como o sistema comunica processamento. A Orison não usa spinners
tradicionais — o feedback de loading é linear, direcional e alinhado com a
identidade.

**Skeleton (`loading-skeleton`):**
Gradient shimmer horizontal sobre superfícies. O gradient usa as cores do
sistema (surface → midnight → surface) e se move com easing linear e duração
cinematic (1400ms), em loop infinito. O shimmer é sutil — opacidade baixa,
velocidade constante. Nunca use skeleton com bordas arredondadas que
contradigam o `rounded-none` do sistema.

**Pulse (`loading-pulse`):**
Alternância de opacidade (0.4 → 1.0 → 0.4) com duração slow e easing state.
Para indicadores pontuais — ícones de status, dots de atividade. O pulse é o
"respiro" do sistema.

**Bar (`loading-bar`):**
Barra linear horizontal de 2px, cor crimson, no topo da viewport. Cresce com
easing state conforme o progresso é determinado. Para loading indeterminado,
usa um pattern de ida-e-volta com duração dramatic.

**Regras de loading:**
- Skeleton é o padrão para conteúdo estruturado (tabelas, cards, seções).
- Pulse é para indicadores isolados (status de conexão, heartbeat de agente).
- Bar é para ações globais (navegação de página, submit de formulário).
- Nunca use spinner rotativo.
- Nunca use mais de um padrão de loading simultaneamente na tela.

---

## Organisms — Page Transition

Transições entre páginas ou seções inteiras. A Orison usa transição
sequencial, nunca simultânea — a página antiga sai completamente antes da
nova entrar.

**Sequência:**
1. Página antiga: `exit-fade` (150ms)
2. Gap de repouso: 50ms
3. Nova página: `enter-reveal` (600ms)

O gap de 50ms é intencional — cria um micro-momento de "escuridão" que separa
os dois contextos e permite ao olho resetar. Sem o gap, a transição parece um
morph; com ele, parece uma mudança deliberada de cena.

**Regras:**
- Nunca use slide lateral entre páginas — isso sugere carrossel.
- Nunca use crossfade (overlap de opacidade) — cria ghosting visual.
- O scroll position reseta ao topo na nova página.

---

## Organisms — Modal Choreography

Modais envolvem três camadas coordenadas: overlay, backdrop e modal. A
coreografia define quem se move primeiro e como.

**Sequência de abertura:**
1. Overlay (escurecimento) + backdrop (blur 2px + scale 0.98) — simultâneos,
   duração moderate (400ms)
2. Modal: `enter-materialize` — delay de 100ms após o overlay iniciar

O overlay e o backdrop começam juntos porque são a mesma operação semântica
(preparação do contexto). O modal espera 100ms para que o fundo esteja
parcialmente preparado — o modal nunca aparece sobre um fundo ainda claro.

**Sequência de fechamento (ordem inversa):**
1. Modal: exit com scale sutil (1.0 → 0.98) + opacity, duração fast
2. Overlay + backdrop: retornam ao normal, duração base

**Regras:**
- O backdrop nunca usa blur acima de 2px — legibilidade do contexto.
- O overlay usa `rgba(10, 10, 10, 0.75)` — coerente com o `black` do sistema.
- Nunca use slide-in para modais — modais materializam, não deslizam.

---

## Organisms — Scroll Reveal

O padrão de revelação progressiva no scroll. É o organismo mais frequente em
páginas web e landing pages da Orison.

**Mecânica:**
- Trigger: IntersectionObserver com threshold 0.15 (15% do elemento visível)
- Root margin: `0px 0px -60px 0px` (trigger 60px antes do fundo da viewport)
- Molécula: `enter-reveal` (translateY 24px + opacity)
- Stagger: `base` (60ms) com decay 0.9× e cap em 8 itens
- Once: true — a animação executa uma vez e o observer desconecta

**Root margin negativo:** O `-60px` no bottom garante que o reveal comece
quando o elemento está ligeiramente acima do fundo da viewport — o usuário vê
a animação acontecer, não o resultado estático depois que já passou.

**Regras:**
- Nunca re-animar elementos que já foram revelados (scroll reverso).
- Em telas com menos de 600px, reduzir translateY para 16px.
- Elementos above-the-fold nunca usam scroll-reveal — entram com a
  page transition ou hero sequence.

---

## Organisms — Data Population

Como gráficos, tabelas e KPIs ganham vida. Em um sistema data-driven como a
Orison, a animação de dados é funcional — comunica magnitude e progressão, não
entretenimento.

**Linhas de tabela:**
Entrada com `enter-data` (translateY 8px + opacity, 150ms) em stagger denso
(40ms). Cap em 12 itens. Tabelas maiores que 20 linhas aparecem sem stagger.

**Barras de chart:**
Cada barra escala verticalmente de 0 a 100% com origin-bottom, duração
moderate (400ms), easing emphasis. Stagger base (60ms). O crescimento de baixo
para cima é a metáfora natural de progresso. Sem bounce no topo.

**Linhas de chart:**
Stroke-dashoffset anima de 100% a 0%, desenhando a linha progressivamente.
Duração dramatic (900ms), easing enter. A linha se revela da esquerda para a
direita.

**KPI counter:**
Contagem numérica de 0 ao valor target com duração dramatic (900ms), easing
state. O counter comunica magnitude — números grandes parecem "maiores" porque
o counter leva mais dígitos para percorrer.

**Regras de data animation:**
- Dados nunca animam em re-render (ex.: filtro aplicado) — apenas no load
  inicial.
- Se os dados mudam em tempo real (dashboard), o update é uma transição
  numérica suave, não um re-animate da visualização inteira.
- Charts com mais de 20 barras: sem stagger individual.

---

## Organisms — List & Grid Stagger

Padrões de revelação para coleções de elementos repetidos.

**List stagger:**
Reveal vertical (translateY 16px + opacity) com stagger decrescente (base 60ms,
decay 0.9×, cap 8). Cada card anuncia presença individualmente antes de se
juntar ao grupo visual. Após o cap, os restantes aparecem em bloco.

**Grid stagger:**
Materialização (scale 0.96 → 1.0 + opacity) com padrão row-first: esquerda →
direita, topo → base. Stagger base com cap. O pattern row-first respeita a
leitura ocidental natural.

**Regras:**
- Em mobile (< 600px), listas colapsam o stagger para 3 itens máximos.
- Grids com mais de 16 itens aparecem sem stagger.
- Nunca use stagger random — a ordem é sempre previsível e semântica.

---

## Organisms — Navigation & Drawer

**Mudança de item ativo no sidebar:**
Transição direta de cor — sem indicador deslizante, sem slide vertical. O item
antigo perde o background ativo (`rgba(139,26,26,0.10)`) e o texto retorna a
offwhite. O novo item ganha o background e o texto crimson-text. Duração fast,
simultâneo.

A ausência de indicador deslizante é uma decisão de identidade: indicadores
que deslizam sugerem playfulness. A Orison troca de estado com precisão
binária.

**Drawer toggle (mobile):**
Entrada: sidebar desliza 240px da esquerda com easing emphasis e duração slow.
Overlay escurece simultaneamente. A saída é 70% mais rápida (easing exit,
duração base).

---

## Templates — Elpis (CLI/Terminal)

O contexto mais restrito. Terminal não suporta CSS transforms — motion aqui
é funcional e textual.

**Moléculas permitidas:** pulse, bar, progress, counter.

**Padrões exclusivos:**
- **Typewriter:** Caracteres aparecem sequencialmente com char-delay de 20ms
  e line-delay de 80ms. Easing linear. Para output de agentes.
- **Status indicators:** `thinking` → pulse, `processing` → bar,
  `complete` → aparição instantânea, `error` → aparição instantânea com cor.

**Teto de duração:** 400ms. Redução de 40% em relação aos valores web.

**Restrições:**
- Sem translateY/X — terminal é sequencial por natureza.
- Sem scale — não aplicável em text output.
- Todo motion é feedback funcional, nunca decorativo.

---

## Templates — Client Presentation

O contexto mais expressivo. Slides, propostas, demos. Aqui o motion carrega
peso narrativo — cada reveal é parte da história.

**Multiplicadores:** Durações × 1.4, staggers × 1.5.

**Transição entre slides:**
Fade-out da atual (150ms) → gap de 200ms → reveal da nova (840ms). O gap
mais longo que web (200ms vs 50ms) cria pausa dramática entre cenas.

**Sequência de título:**
1. Eyebrow (Label, crimson-text): opacity com letter-spacing animando de 12px
   a 5px — as letras "se aproximam" criando foco. Delay 200ms.
2. Título (Display LG): `enter-slide-x` da esquerda, duração slow.
3. Subtítulo: fade, delay após título.

**Barra crimson animada:**
A barra vertical de 3px (slide cover do `orisonDesign.md`) pode animar
height de 0 a 100% com easing emphasis e duração dramatic. Uso exclusivo de
abertura — executa uma vez.

**Restrições:**
- Máximo 3 elementos animando por slide.
- Sem loops — tudo executa uma vez.
- Sem fly-ins, bounces, zooms ou transições pré-definidas de software de
  apresentação.

---

## Templates — Landing Page

Equilíbrio entre expressividade e performance.

**Hero sequence (above-the-fold):**
Sequência orquestrada de 4 etapas com delays escalonados:
1. Eyebrow: opacity, delay 200ms
2. Headline: reveal com translateY 48px, delay 400ms
3. Subheadline: fade, delay 700ms
4. CTA (botão): materialize, delay 1000ms

A sequência total dura ~1600ms. Cada elemento espera o anterior ganhar
presença suficiente antes de aparecer. O CTA é o último — a ação só é
oferecida depois que o contexto foi estabelecido.

**Scroll reveals:** Organismo padrão de scroll-reveal, sem modificações.

**Restrições:**
- Todas as animações usam exclusivamente `transform` e `opacity` (GPU).
- Nenhuma animação individual excede 1400ms.
- Scroll-reveals executam uma vez — `IntersectionObserver.unobserve()` após
  trigger.
- Sem parallax — o sistema é ortogonal, não tridimensional.

---

## Templates — Dashboard

O contexto mais funcional. Motion serve à compreensão de dados.

**Moléculas permitidas:** enter-data, counter, skeleton, bar, hover-surface.

**Loading sequence:**
1. Skeleton aparece imediatamente no mount
2. Dados chegam: skeleton fade-out (fast) + data populate com stagger denso
3. KPIs: counter animate de 0 ao valor

**Restrições:**
- Sem stagger em tabelas com mais de 20 linhas.
- Skeleton em vez de spinners — sempre.
- Updates de dados em tempo real: transição numérica suave, sem re-render
  animado da visualização.
- Duração máxima: 400ms.

---

## Governance — Performance

Toda animação da Orison deve rodar a 60fps. Sem exceções, sem fallbacks
graceful para 30fps.

**Propriedades permitidas para animação:**
`transform`, `opacity`, `filter`, `clip-path`, `background-position`,
`stroke-dashoffset`.

**Propriedades proibidas para animação:**
`width`, `height`, `margin`, `padding`, `top`, `right`, `bottom`, `left`,
`border-width`, `font-size`.

Animar propriedades proibidas causa reflow do layout — o browser recalcula
posição de todos os elementos no DOM. Isso é incompatível com 60fps e com a
identidade de precisão da Orison.

**`will-change`:** Declarar apenas durante a animação ativa, remover
imediatamente após. `will-change` permanente consome memória GPU sem
benefício.

---

## Governance — Accessibility

`prefers-reduced-motion` é cidadão de primeira classe — não um afterthought
adicionado no final do desenvolvimento.

**Quando ativo:**
- Todas as durações caem para `0.01s` (não zero — zero causa flash).
- Todos os translateY/X são removidos (o elemento aparece na posição final).
- Opacity transitions mantidas — comunicam informação, não decoração.
- Stagger eliminado — todos os itens aparecem simultaneamente.
- Skeleton shimmer torna-se placeholder estático com opacidade reduzida.
- Counter exibe valor final instantaneamente, sem contagem.

**Regra:** Nunca trate `prefers-reduced-motion` como "desativar animações".
Trate como "remover movimento desnecessário, preservar mudanças de estado
informativas".

---

## Governance — Composition

Regras que previnem combinações caóticas de motion, especialmente quando
agentes de IA geram interfaces.

**Regra fundamental:** Máximo duas propriedades animando simultaneamente por
elemento por transição.

**Combinações permitidas:**
- translateY + opacity (reveal)
- scale + opacity (materialize)
- translateX + opacity (slide)
- background-color + transform (hover states)

**Combinações proibidas:**
- translateX + translateY + scale (sobrecarga tridimensional)
- opacity + scale + translate (três dimensões de mudança)
- Qualquer transform + width/height (mistura GPU e reflow)

---

## Governance — Naming Convention

Tokens de motion seguem o padrão semântico:
`motion-[camada]-[tipo]-[variante]`

**Camadas:**
- `atom` — primitivos (easing, duration, transform)
- `mol` — moléculas (enter, exit, state, micro, loading)
- `org` — organismos (page, modal, scroll, data, list, nav)
- `tpl` — templates (elpis, presentation, landing, dashboard)

**Exemplos:**
- `motion-atom-easing-enter`
- `motion-atom-duration-slow`
- `motion-mol-enter-reveal`
- `motion-mol-state-hover-primary`
- `motion-org-scroll-reveal`
- `motion-org-data-chart-bar`
- `motion-tpl-landing-hero`
- `motion-tpl-dashboard-loading`

---

## Governance — Crimson in Motion

O crimson em motion segue a mesma disciplina do design estático: uso cirúrgico,
uma ocorrência por contexto.

**Usos permitidos:**
- Loading bar linear no topo da viewport (2px, crimson)
- Border-left accent animado em slide covers (3px, height 0→100%)
- Focus ring em botão primary

**Usos proibidos:**
- Pulsação de fundo crimson (background pulsando)
- Glow ou sombra colorida animada
- Partículas, trails ou efeitos de emissão
- Qualquer uso que faça o crimson parecer decorativo em vez de funcional

---

## Organisms — Logo Motion

O organismo de maior impacto identitário da Orison. Não é um componente de UI —
é uma peça cinematográfica. Usada em slides de capa, capas de proposta, header
de site e vídeos institucionais.

**Conceito: "Incisão"**

A Orison não se constrói — ela se revela. A logo não "monta" peça por peça.
A linha crimson corta o silêncio como uma declaração de intenção, e os círculos
se formam ao redor dela como consequência inevitável.

**Princípio:** A linha crimson existe primeiro. Ela é a âncora.

**Sequência — Símbolo Isolado (~1.6s):**

| Beat | Elemento | Técnica | Duração | Easing | Início |
|------|----------|---------|---------|--------|--------|
| 1 — Incisão | Linha crimson | `scaleY(0→1)` de center | `instant` 80ms | `micro` | 0ms |
| 2 — Pausa | — | silêncio visual | 200ms | — | 80ms |
| 3 — Núcleo | Círculo interno | `stroke-dashoffset` 182.21→0 | `dramatic` 900ms | `enter` | 280ms |
| 4 — Estrutura | Círculo externo | `stroke-dashoffset` 289.03→0 | `dramatic` 900ms | `enter` | 480ms |
| 5 — Settle | Linha crimson | opacity pulse 0.9→0.55→0.9 | 200ms | `state` | 1380ms |

**Beats adicionais — Lockup Horizontal (~2.6s):**

| Beat | Elemento | Técnica | Duração | Easing | Início |
|------|----------|---------|---------|--------|--------|
| 6 — Divisor | Barra vertical slate | `opacity: 0→1` | `base` 250ms | `state` | 1600ms |
| 7 — Wordmark | "ORISON" | `opacity: 0→1` + `letter-spacing: 12px→6px` | `slow` 600ms | `emphasis` | 1800ms |
| 8 — Subtítulo | "AI INFRASTRUCTURE" | `opacity: 0→1` | `moderate` 400ms | `state` | 2200ms |

**Beats adicionais — Lockup Vertical (~2.5s):**

| Beat | Elemento | Técnica | Duração | Easing | Início |
|------|----------|---------|---------|--------|--------|
| 6v — Divisor | Barra horizontal crimson | `scaleX(0→1)` de center | `base` 250ms | `micro` | 1600ms |
| 7v — Wordmark | "ORISON" centralizado | `opacity: 0→1` + `letter-spacing: 14px→8px` | `slow` 600ms | `emphasis` | 1850ms |

**Por que `letter-spacing` anima (exceção ao governance):**
Letter-spacing causa reflow, mas é permissível em duas condições: (1) o elemento é
isolado no DOM — nenhum sibling é afetado pelo reflow; (2) a animação executa
**uma única vez** por sessão, não em loops ou re-triggers frequentes. A convergência
das letras é um gesto narrativo, não um estado de UI.

**Implementação técnica:**
- SVG inline (não `<use>`) — cada element (`line`, `circle`) é acessado pelo JS via `getElementById`
- Círculo interno: `stroke-dasharray: 182.21` (2π×29), `stroke-dashoffset` anima de 182.21→0
- Círculo externo: `stroke-dasharray: 289.03` (2π×46), `stroke-dashoffset` anima de 289.03→0
- Início da draw no topo: `transform: rotate(-90deg)` no elemento (`transform-origin: center`)
- Linha: `transform-origin: 55px 55px; scaleY(0→1)` — ambas as metades crescem do centro
- Arquivo: `src/sections/28-logo-motion.html` + JS em `src/main.js`

**Contexts de uso:**
- **Slide cover:** Lockup completo, executa uma vez na abertura
- **Proposta (A4):** Estático — layout sugere sequência congelada no Beat 4 (ambos os círculos visíveis, linha presente)
- **Site header:** Símbolo isolado apenas, primeiro load da sessão
- **Vídeo institucional:** Lockup completo com multiplicador × 1.4 (durações × 1.4), Beat 0 silêncio de 1s

**Reduced motion:**
Todos os elementos aparecem diretamente no estado final em `0.01s`. Nenhum
translate, nenhuma contagem de dashoffset, sem pulse. O resultado é um logo
estático imediato — funcional sem qualquer movimento.

---

## Organisms — Data Visualization Charts

Charts são instrumentos de precisão — não decoração. A animação serve a um
propósito único: comunicar magnitude e progressão ao usuário antes que ele
leia os valores. Ver seções 32 e 33 da página de preview.

**Bar Chart:**
Cada barra escala verticalmente de `scaleY(0)` a `scaleY(1)` com
`transform-origin: bottom`. Duração `moderate` (400ms), easing `emphasis`
(spring controlado). Stagger `base` (60ms, decrescente). O crescimento de
baixo para cima é a metáfora natural de acumulação. Sem bounce no topo —
a barra toca o valor e para.

**Line Chart:**
O traçado usa `stroke-dashoffset` de 100% a 0%, desenhando a linha
progressivamente da esquerda para direita. Duração `dramatic` (900ms),
easing `enter`. Para múltiplas séries, a série primária (crimson) anima
primeiro; a secundária entra 150ms depois.

**Donut Chart:**
Cada segmento usa `stroke-dasharray: [visible] [gap]` + `stroke-dashoffset`
do valor visível a 0. A rotação de cada segmento é calculada a partir da
posição acumulada dos anteriores (graus = porcentagem × 360). Duração
`moderate` (400ms), easing `emphasis`, stagger `base` (60ms) entre segmentos.
O contador central usa `micro-counter` concorrente ao maior segmento.

**Regras universais de chart:**
- Nunca mais de 3 séries por chart; crimson é sempre a série primária.
- Eixos sempre em `micro` (8px, uppercase, `text-muted`).
- Grid lines opcionais: 1px, `rgba(255,255,255,0.04)`, horizontal apenas.
- `border-radius: 0` em todas as barras — charts são instrumentos, não cards.
- Dados não re-animam em re-render (filtro, atualização) — apenas no load inicial.

---

## Organisms — Real-time Data

Padrões para interfaces com dados que mudam continuamente. A distinção
fundamental em relação a data population: **real-time é incremental, não
total**. Um dado novo chega; a visualização se atualiza pontualmente. Ver
seção 36 da página de preview.

**Counter Update (Live KPI):**
Quando um KPI recebe um novo valor, a transição numérica dura 300ms com
easing `state`. O debounce mínimo é 2s — nunca mais de uma atualização
visual por segundo, independente da frequência dos dados chegando. O delta
badge ("+2.4%") troca com `exit-fade` + `enter-fade` 150ms cada quando
a direção muda.

**Stream Pulse (Dot indicator):**
O dot crimson de 4-6px pulsa `scale(1 → 1.5 → 1)` em 300ms com easing
`emphasis` ao receber cada novo dado. Se o dado não chega por mais de 30s,
o dot muda de `background: crimson` para `background: subtle` — sinaliza
silêncio sem alarmar.

**Table Row Insert:**
Novas linhas entram com `enter-data` (translateY 8px + opacity, 150ms,
easing `micro`). Quando a tabela atinge o limite de linhas visíveis (5),
a linha mais antiga executa `exit-fade` (opacity 0, 150ms) antes do insert.
Sem stagger — real-time insere uma linha por vez.

**Alert / Anomaly Pulse:**
Quando um KPI detecta anomalia, a borda do card pulsa crimson: dois ciclos
de `border-color: border → crimson → border`, 300ms cada. Após o pulse, a
borda estabiliza em crimson estático — comunicando estado persistente. Nunca
mais de um alerta pulsando simultaneamente.

**Regras de real-time:**
- Debounce visual mínimo 2s — frequência de dado ≠ frequência de update visual.
- O "silêncio" (ausência de dado) é comunicado por estado visual (dot dim),
  nunca por ausência de feedback.
- Streams devem ter botão explícito de start/stop — nunca iniciam
  automaticamente sem ação do usuário.

---

## Organisms — Command Center

O command center é o template de maior densidade informacional da Orison.
Combina layout, hero 3D, charts em tempo real e KPIs em uma única superfície.
Ver seções 34 e 35 da página de preview.

**Layout canônico:**

```
┌─────────────────────────────────────────────────────┐
│  HEADER BAR (48px) — breadcrumb · KPI stubs · clock │
├──────────┬──────────────────────────┬───────────────┤
│  LEFT    │                          │  RIGHT        │
│  PANEL   │     HERO ZONE (3D)       │  PANEL        │
│ 240-320px│    (50-60% viewport)     │  240-320px    │
├──────────┴──────────────────────────┴───────────────┤
│  BOTTOM BAR (180-240px) — data table · activity feed│
└─────────────────────────────────────────────────────┘
```

**Regras de layout:**
- Máximo 12 widgets simultâneos na tela (KPI cards + charts + tabelas).
- Painéis laterais usam `opacity: 0.85` — o hero 3D respira através deles.
- Header é sempre 48px — nunca cresce nem colapsa.
- Em viewport < 1200px, os painéis laterais colapsam para drawers.

**Hero 3D — Especificações:**

O hero 3D ocupa o centro visual do command center. Seu propósito é comunicar
a natureza do dado sendo monitorado de forma imediata e emocional — antes que
o usuário leia qualquer número.

| Propriedade | Valor | Notas |
|---|---|---|
| Wireframe | `offwhite` opacity 0.15 | Estrutura leve, não compete com os dados |
| Highlight | `crimson` opacity 0.3 | Acentua pontos de atenção |
| Rotação | 0.002 rad/frame, eixo Y | Lenta o suficiente para não distrair |
| Easing rotação | linear | Velocidade constante — sem aceleração |
| Background | `black` | Máximo contraste para os elementos 3D |

**Cinco tipos de hero:**

| Tipo | Dado representado | Técnica visual |
|---|---|---|
| **Globo** | Operações distribuídas geograficamente | Pontos georreferenciados em esfera rotativa |
| **Network** | Conexões entre entidades, data flows | Nós e arestas com espessura proporcional |
| **Partículas** | Throughput, processamento, volume | Densidade de partículas indica intensidade |
| **Molecular** | Composição, dependências, hierarquia | Clusters com força de ligação variável |
| **Cubo** | Dados multidimensionais, 3 variáveis | Faces do cubo codificam dimensões distintas |

**Regras do hero 3D:**
- Nunca mais de um tipo de hero por command center.
- A rotação para quando o usuário interage com o painel (hover ou click).
- Dados no hero só pulsam quando há anomalia — movimento constante
  de dados normais cria ruído visual.
- Em `prefers-reduced-motion`: hero estático, sem rotação, sem pulso.

---

## Do's and Don'ts — Motion

**✓ Do:**
- Use `enter-reveal` como default para qualquer aparição de conteúdo.
- Aplique exit-ratio (0.7×) em todas as saídas.
- Teste toda animação com `prefers-reduced-motion` ativo.
- Use stagger decrescente com cap de itens.
- Especifique propriedades individuais em `transition` — nunca `all`.
- Use IntersectionObserver para scroll reveals — nunca scroll listeners.
- Mantenha 60fps em todas as animações.

**✗ Don't:**
- Não use `transition: all` — especifique propriedades.
- Não use bounce, wobble, shake ou qualquer efeito elástico.
- Não use spinner rotativo — use skeleton, pulse ou bar.
- Não anime propriedades que causam reflow (width, height, margin).
- Não re-anime elementos já revelados no scroll reverso.
- Não use mais de dois transforms simultâneos por elemento.
- Não crie curvas de easing fora das seis definidas.
- Não use motion decorativo — cada animação serve a uma função.
- Não use parallax — a Orison é ortogonal.
- Não use crossfade entre páginas — causa ghosting.
- Não use fly-in, zoom-in ou slide pré-definidos de software de apresentação.
- Não anime crimson fora dos usos permitidos.
