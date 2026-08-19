---
version: "1.1"
name: Orison Brand System Prompt
description: >
  Sistema de design e identidade visual da Orison — empresa de infraestrutura
  de IA para negócios. Este documento é a fonte normativa de todos os ativos
  de design: tokens de cor, tipografia, espaçamento, bordas, sombras, motion e
  componentes de UI.

colors:
  # Identidade — superfícies e fundo
  black: "#0a0a0a"
  midnight: "#111113"
  surface: "#0d0d0f"
  slate: "#3a3a3a"
  border: "#2e2e2e"
  border-strong: "#3a3a3a"
  gray: "#5a5a5a"
  subtle: "#484848"
  offwhite: "#e8e6e1"

  # Texto — escala concreta (sem empilhamento de opacidade)
  text-primary: "#f7f5f0"
  text-body: "#edeae4"
  text-secondary: "#d4d2cd"
  text-muted: "#bcbab5"

  # Acento — crimson é a cor de ação e destaque exclusivo
  crimson: "#8B1A1A"
  red: "#A52020"
  crimson-text: "#F06070"

  # Opacidade semântica
  text-dim: "rgba(232, 230, 225, 0.55)"

  # Visualização de dados
  negative-hi: "#8B1A1A"
  negative-md: "#C0392B"
  alert-hi: "#8B4A1A"
  alert-md: "#C0622B"
  positive-hi: "#1A5C2E"
  positive-md: "#27834A"

  # Acento de borda
  border-accent: "#8B1A1A"

  # Data Visualization — v1.1, validado com scripts/validate_palette.js
  # A paleta anterior REPROVAVA sobre #0d0d0f: teal x steel davam ΔE 7.2 em
  # visão normal (piso 15) e 4.9 em deuteranopia. Os seis ângulos de matiz
  # da Orison foram preservados; só luminosidade e croma mudaram.

  # Categórica (6 — máximo). Ordem fixa: É o mecanismo de segurança CVD.
  cat-crimson: "#c50006"
  cat-teal: "#00999f"
  cat-amber: "#f35c00"
  cat-plum: "#a820a8"
  cat-olive: "#327000"
  cat-steel: "#0058d2"

  # Sequencial Crimson (6 steps). Seis, não oito: acima de ~7 classes as
  # adjacentes borram, e 8 passos sobre quase-preto só cabem se o croma cair
  # a ponto de deixar de ser crimson. Todos >= 2:1 contra a superfície.
  seq-1: "#910009"
  seq-2: "#a7211f"
  seq-3: "#bd3833"
  seq-4: "#d34e45"   # tinta de dado padrão — --color-data-primary
  seq-5: "#ea6258"
  seq-6: "#ff776b"

  # Sequencial Neutro (6 steps)
  neu-1: "#524442"
  neu-2: "#635553"
  neu-3: "#756664"
  neu-4: "#887876"
  neu-5: "#9b8a88"
  neu-6: "#ae9d9b"

  # Divergente (5). Em fundo escuro a lógica inverte: centro apagado,
  # intensidade cresce para as pontas. A escala anterior não era monotônica.
  div-neg-hi: "#ea3d38"
  div-neg: "#a8564e"
  div-neutral: "#605d5c"
  div-pos: "#3b834e"
  div-pos-hi: "#00a635"

  # Série de contexto (padrão de ênfase: 1 cor + cinza)
  dv-muted: "#5a5250"

typography:
  # Display — Cormorant Garamond (editorial, identidade)
  # v1.1: reservado a wordmark, títulos de painel e peças editoriais.
  # Valores numéricos migraram para o sans — ver `numeric` abaixo.
  display-xl:
    fontFamily: Cormorant Garamond
    fontSize: 3rem      # 48px
    fontWeight: 300
    letterSpacing: 0.16em
  display-lg:
    fontFamily: Cormorant Garamond
    fontSize: 2.25rem   # 36px
    fontWeight: 300
    letterSpacing: 0.16em
  display-md:
    fontFamily: Cormorant Garamond
    fontSize: 1.75rem   # 28px
    fontWeight: 300
    letterSpacing: 0.16em
  display-sm:
    fontFamily: Cormorant Garamond
    fontSize: 1.375rem  # 22px
    fontWeight: 300
    letterSpacing: 0.16em
  display-xs:
    fontFamily: Cormorant Garamond
    fontSize: 1.125rem  # 18px
    fontWeight: 300
    letterSpacing: 0.16em

  # Numérico — Montserrat. Todo valor de KPI, célula e eixo.
  numeric-lg:
    fontFamily: Montserrat
    fontSize: 1.75rem   # 28px — KPI de painel
    fontWeight: 500
    letterSpacing: -0.01em
  numeric-md:
    fontFamily: Montserrat
    fontSize: 1.25rem   # 20px — KPI de header
    fontWeight: 500
  numeric-sm:
    fontFamily: Montserrat
    fontSize: 1rem      # 16px

  # Interface — Montserrat. Piso absoluto: 10px.
  body:
    fontFamily: Montserrat
    fontSize: 0.8125rem # 13px
    fontWeight: 400
    lineHeight: 1.6
  text-sm:
    fontFamily: Montserrat
    fontSize: 0.875rem  # 14px
  label:
    fontFamily: Montserrat
    fontSize: 0.6875rem # 11px
    fontWeight: 500
    letterSpacing: 0.22em
  micro:
    fontFamily: Montserrat
    fontSize: 0.625rem  # 10px — PISO ABSOLUTO
    fontWeight: 500
    letterSpacing: 0.26em

spacing:
  base: 8px
  1: 4px
  2: 8px
  3: 12px   # v1.1 — o passo que faltava; sem ele a UI densa caía em 10/3/2px cru
  4: 16px
  5: 24px
  6: 32px
  7: 48px
  8: 64px
  9: 80px

rounded:
  none: 0px
  sm: 2px
  md: 4px
  lg: 8px
  full: 9999px

components:
  # Botão primário — ação principal, use com parcimônia
  button-primary:
    backgroundColor: "{colors.crimson}"
    textColor: "{colors.offwhite}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.red}"
  button-primary-active:
    backgroundColor: "{colors.crimson}"
  button-primary-disabled:
    backgroundColor: "{colors.crimson}"

  # Botão ghost — ação secundária
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.offwhite}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 28px"
  button-ghost-hover:
    backgroundColor: "transparent"

  # Badge — status e categorização
  badge-crimson:
    backgroundColor: "rgba(139, 26, 26, 0.15)"
    textColor: "{colors.crimson-text}"
  badge-alert:
    backgroundColor: "rgba(139, 74, 26, 0.15)"
    textColor: "#E07840"
  badge-positive:
    backgroundColor: "rgba(26, 92, 46, 0.15)"
    textColor: "#3AAA62"
  badge-neutral:
    backgroundColor: "rgba(90, 90, 90, 0.15)"
    textColor: "{colors.text-secondary}"

  # Input field — entrada de dados
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.offwhite}"
    typography: "{typography.body}"
  input-focus:
    backgroundColor: "{colors.surface}"
  input-error:
    backgroundColor: "{colors.surface}"
  input-disabled:
    backgroundColor: "{colors.surface}"

  # Sidebar — navegação fixa desktop (240px)
  sidebar:
    backgroundColor: "{colors.midnight}"
    textColor: "{colors.offwhite}"
    width: "240px"
  sidebar-item-active:
    backgroundColor: "rgba(139, 26, 26, 0.10)"
    textColor: "{colors.crimson-text}"

  # KPI Card — variantes: Simple, Spark, Ring, Metric (seção 33)
  kpi-card:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.none}"
    padding: "24px"
    label: "{typography.micro}"
    value: "{typography.display-md}"
    delta-positive: "{colors.positive-md}"
    delta-negative: "{colors.negative-md}"
    numeric-rendering:
      font-variant-numeric: "tabular-nums"
      font-feature-settings: '"lnum", "tnum"'
      note: >
        Cormorant Garamond usa old-style numerals por padrão — dígitos 3,4,5,7,9
        ficam abaixo da baseline. lnum força lining numerals (todos na mesma
        altura). tnum garante largura fixa por dígito (mesmo efeito de tabular-nums,
        mas via OpenType). Ambos são obrigatórios em todo elemento numérico.
    layout-stability:
      display: "inline-block"
      min-width: "140px (display-md) | 100px (display-xs) | 60px (percentuais)"
      text-align: "right"
      note: >
        min-width fixo previne layout shift quando o número muda de comprimento
        (ex: "R$ 89.636" → "R$ 102.000"). text-align right alinha os dígitos
        pelo lado das unidades — o olho ancora à direita em dados numéricos.

  # Chart — regras universais para bar, line, donut, area (seção 32)
  chart:
    background: "{colors.surface}"
    axis-color: "{colors.subtle}"
    axis-typography: "{typography.micro}"
    grid-line: "1px rgba(255,255,255,0.04) horizontal"
    primary-series: "{colors.crimson}"
    secondary-series: "{colors.slate}"
    border-radius: "{rounded.none}"
    max-series: 3
    value-typography: "{typography.body}"
---

# Orison Brand System

> **Documento normativo de design.** Todos os ativos visuais da Orison nascem
> aqui. Designers e agentes de IA devem consultar este arquivo como fonte única
> de verdade para cor, tipografia, espaçamento, forma, voz e componentes.

---

## Overview

A Orison é uma empresa de infraestrutura de inteligência artificial para
negócios. Seu posicionamento não é o de uma ferramenta, mas de um organismo —
algo que age, aprende e transforma as operações de quem o adota.

**Personalidade visual:** Calculada. Precisa. Sóbria. Inevitável.

A identidade visual da Orison é construída sobre **escuridão intencional**:
fundos quase pretos, tipografia editorial em contraste máximo e um único acento
cromático — o crimson — usado com disciplina cirúrgica. Não há ornamentos
desnecessários. Cada elemento serve a uma função.

**Público-alvo:** Executivos, heads de operações e decisores técnicos em
empresas B2B de médio a grande porte. A identidade deve transmitir
confiabilidade institucional sem abrir mão de uma presença visual que cause
impacto.

**Resposta emocional esperada:** Ao ver um material da Orison, o observador
deve sentir que está diante de algo rigoroso, inevitável e de alta performance.
Nunca jovial, nunca genérico, nunca ansioso.

**Princípio unificador:** *Menos elementos, mais peso.* A identidade ganha
força pela subtração — pelo que se escolhe não mostrar.

---

## Colors

A paleta é construída sobre neutros de alto contraste (dark-first) e um único
acento evocativo. O crimson não é uma cor decorativa: é uma declaração de
intenção.

**Superfícies (do mais escuro ao mais claro):**
- **Black (#0a0a0a):** Fundo absoluto. Usado em cartões de visita frente, slide
  covers e ambientes de máximo contraste.
- **Midnight (#111113):** Superfície primária da interface. Base de todos os
  painéis e seções do brand book.
- **Surface (#0d0d0f):** Superfície secundária para elevação sutil — cards,
  tabelas, células de estado e blocos de detalhe.
- **Slate (#3a3a3a):** Bordas estruturais, divisores e separadores no tema
  escuro.
- **Off-White (#e8e6e1):** Quente, nunca puro branco. Texto principal,
  wordmarks em fundo escuro e face clara do cartão.

**Acento:**
- **Crimson (#8B1A1A):** A única cor de ação. Usada em destaques, bordas de
  acento, botões primários, indicadores de navegação ativa e pontos de
  interação críticos. Use com parcimônia — uma vez por tela quando possível.
- **Red (#A52020):** Estado hover do crimson. Nunca usado como cor standalone.
- **Crimson-Text (#F06070):** Variante legível do crimson para texto sobre
  fundo escuro (contraste ≥ 5.5:1). Usado em labels, badges e links.

**Texto — escala concreta (sem empilhamento de `opacity`):**
- **Text-Primary (#f7f5f0):** Títulos, wordmarks, headings de seção.
- **Text-Body (#edeae4):** Parágrafos, descrições e conteúdo de leitura.
- **Text-Secondary (#d4d2cd):** Labels, especificações, metadados.
- **Text-Muted (#bcbab5):** Texto de suporte, placeholders, itens inativos.

**Visualização de dados:**
- **Negative (hi/md):** Vermelho escuro para KPIs negativos e alertas críticos.
- **Alert (hi/md):** Âmbar escuro para avisos e dados atenção.
- **Positive (hi/md):** Verde escuro para resultados positivos e confirmações.

**Regras de uso de cor:**
- Nunca use o crimson como cor de fundo de superfície ampla.
- Nunca use mais de dois acentos cromáticos em um único layout.
- Mantenha contraste WCAG AA mínimo (4.5:1) para texto; AA+ (5.5:1) é o
  alvo para texto corporal.
- As cores de texto usam valores hexadecimais concretos — nunca aplique
  `opacity` sobre uma cor de texto para criar variações; use a cor correta da
  escala.
- Em fundo claro (off-white), use `midnight` para texto e `crimson` para
  acento mantendo os mesmos papéis semânticos.

---

## Data Visualization Colors

**Reescrito em v1.1.** A paleta anterior foi validada com
`validate_palette.js` (skill `dataviz`) sobre a superfície `#0d0d0f` e
**reprovou**:

```
[FAIL] Chroma floor        teal #1A6B6B (0.074) e steel #4A6A8B (0.065) leem como cinza
[FAIL] CVD separation      steel x teal ΔE 4.9 (deuteranopia)
[FAIL] Normal-vision floor steel x teal ΔE 7.2 — o piso é 15
[WARN] Contrast vs surface crimson 2.09 · amber 2.86 · plum 1.84 — abaixo de 3:1
```

Duas das seis séries eram indistinguíveis **mesmo com visão de cor normal**. As
rampas sequenciais desperdiçavam os três primeiros passos abaixo do piso de
visibilidade (1.01–1.27:1 — invisíveis sobre o fundo), e a escala divergente não
era monotônica: `neg-hi` era mais clara que `neg`.

**A correção preserva a identidade.** Os seis ângulos de matiz da Orison são
mantidos (crimson 27°, amber 53°, olive 129°, teal 195°, steel 250°, plum 328°);
apenas luminosidade e croma entraram na banda válida. A paleta resultante passa
nas seis checagens:

```
[PASS] Lightness band       all 6 inside L 0.48–0.67
[PASS] Chroma floor         all 6 >= 0.1
[PASS] CVD separation       worst adjacent ΔE 16.5 (protan)
[PASS] Normal-vision floor  worst adjacent ΔE 28.9
[PASS] Contrast vs surface  all 6 >= 3:1
```

**A sobriedade não vem de dessaturar o dado.** Vem da superfície quase-preta e
da parcimônia de cor. A paleta viva é reservada a **marcas finas** — linhas de
2px, pontos de 8px ou mais, barras finas com topo arredondado de 4px. Um bloco
grande e saturado seria off-brand; um traço preciso e legível não é.

**Regras de data visualization:**

- A **ordem** dos slots categóricos é o mecanismo de segurança CVD. Não
  reordenar depois de fixada, e nunca ciclar para uma sétima série — dobre a
  cauda em "Outros" ou facete em small multiples.
- Nunca misture escala sequencial e categórica no mesmo chart.
- A divergente exige um zero semântico real.
- **Cor de identidade ≠ tinta de dado.** `crimson #8B1A1A` fica em 2.1:1 sobre
  quase-preto — serve como acento estrutural, nunca como marca que codifica
  valor. Conteúdo não-textual exige 3:1 (WCAG 1.4.11); use `seq-4 #d34e45`.
- **Ênfase é a forma padrão** para série única: uma cor em destaque, o resto em
  `dv-muted`. É a resposta honesta para a maioria dos widgets deste produto.
- Complemente cor com forma quando a leitura for crítica — rótulo direto, vão
  de 2px entre marcas, textura em contexto de acessibilidade.

> A paleta categórica de 6 cores é um **ativo de sistema para verticais** com
> charts multi-série. O Command Center base é todo de série única (stat tiles e
> uma série de barras), então ela fica definida e validada, aguardando uso —
> não é código morto, é inventário para migração.

---

## Typography

**Alterado em v1.1.** A escala anterior (body 11px, label 9px, micro 8px, tudo
em `px`, com `html{font-size:11px}`) tinha `--micro-size: 8px` como o token de
texto mais usado do produto, e componentes desciam a 7px, 6px e 5px. Para um
painel lido por executivos, isso não era densidade — era ilegibilidade. A
escala nova mantém a densidade pelo espaçamento, não pelo encolhimento.

**Duas famílias, três papéis:**

- **Cormorant Garamond** — camada editorial e de identidade: wordmark, títulos
  de painel, peças de alto impacto.
- **Montserrat (500)** — camada numérica: todo valor de KPI, célula de tabela e
  rótulo de eixo.
- **Montserrat (400/500)** — camada de interface: corpo, rótulos, metadados.

**Por que os números saíram da serifada:** Cormorant Light 300 sobre fundo
quase-preto perde peso óptico, e a fonte usa algarismos old-style por padrão —
os dígitos 3, 4, 5, 7 e 9 caem abaixo da baseline. A v1.0 remendava isso com
`lnum`/`tnum` em todo elemento numérico. Um sans de peso 500 resolve na raiz e
devolve peso ao número, que é o que se lê.

**Regras:**

- **Piso absoluto de 10px.** Nada renderiza abaixo disso — nem glifo decorativo.
- **Escala em `rem`, raiz em `html { font-size: 100% }`.** Nunca aplicar
  `font-size` no `html` junto com uma escala em rem: o rem compõe sobre si
  mesmo e a escala inteira encolhe (foi assim que 10px virou 8.1px em teste).
- **Tracking em `em`, nunca em `px`.** 5px sobre um glifo de 9px é 0.56em; o
  mesmo token sobre 28px seria 0.18em. Tracking em px não é reutilizável.
- Máximo de dois pesos por peça.
- `tabular-nums` **só em colunas** — tabelas e ticks de eixo. Em número grande
  e isolado, largura fixa por dígito deixa "121" frouxo. Exceção deliberada:
  valores de KPI que atualizam ao vivo usam tabular, porque sem isso o número
  treme a cada tick.
- Carregar a fonte via `<link>` com `preconnect` no `index.html` — nunca por
  `@import` aninhado dentro de outro `@import`.

**Nota sobre Montserrat:** o detector do Impeccable a sinaliza como fonte
saturada. Ela é a voz técnica fixada da marca; o achado está registrado e
aceito deliberadamente, não omitido.

---

## Layout

O layout da Orison segue o modelo **Fixed-Max-Width** com largura máxima de
`1080px`, centrado na viewport. O sidebar de navegação (240px) fica fixo à
esquerda em desktop, deslocando o conteúdo principal.

A base do espaçamento é **8px**. Todos os valores da escala são múltiplos
exatos de 8 (com a exceção do meio-passo de 4px para micro-ajustes).

**Escala de espaçamento:**

| Token     | Valor | Uso típico                                      |
|-----------|-------|-------------------------------------------------|
| `space-1` | 4px   | Gaps internos mínimos, icon-text gaps           |
| `space-2` | 8px   | Gaps entre rótulos e valores                    |
| `space-3` | 12px  | **v1.1** — o meio-passo que a UI densa exigia   |
| `space-4` | 16px  | Padding interno de cells e cards                |
| `space-5` | 24px  | Gutters de grid, gap padrão entre cards         |
| `space-6` | 32px  | Padding de painéis menores                      |
| `space-7` | 48px  | Gaps verticais entre blocos                     |
| `space-8` | 64px  | Separação de seções maiores                     |
| `space-9` | 80px  | Padding externo das seções principais           |

Sem o passo de 12px, cinco componentes recorriam a `10px`, `3px` e `2px`
crus — a escala era grosseira demais na base e o produto optava por sair dela.

**Grid interno:**
- Seções usam grid de 2 colunas (`1fr 1fr`) com gap de `2px` — a ausência de
  espaço entre painéis é intencional, criando superfícies contíguas em bloco.
- Grids específicos (swatches, espaçamento, estados) usam 4–8 colunas conforme
  a densidade necessária.

**Padding de seção:** `80px 60px` (vertical/horizontal).

**Breakpoints responsivos:**
- `≤ 1120px`: ajuste de column-gap em grids maiores.
- `≤ 900px`: grids colapsam para 1 coluna; sidebar vira drawer com overlay.
- `≤ 600px`: padding reduzido; layouts horizontais empilham verticalmente.

---

## Elevation & Depth

A Orison não usa sombras decorativas. Profundidade é comunicada por
**contraste tonal entre superfícies**, não por `box-shadow` com blur difuso.

**Hierarquia de superfícies (mais escuro = mais fundo):**
1. `black` (#0a0a0a) — fundo absoluto, impressão
2. `midnight` (#111113) — camada primária da interface
3. `surface` (#0d0d0f) — camada elevada (cards, células)

Sombras são usadas apenas em contextos de **modal/overlay** ou **elevação
funcional** onde o contraste tonal sozinho não é suficiente:

- **Shadow SM:** `0 8px 16px rgba(0,0,0,0.6)` — cards flutuantes leves
- **Shadow MD:** `0 16px 32px rgba(0,0,0,0.5)` — dropdowns, tooltips
- **Shadow LG:** `0 24px 48px rgba(0,0,0,0.7)` — modais, painéis sobrepostos
- **Shadow Inner:** `inset 0 1px 0 rgba(232,230,225,0.04)` — highlight sutil
  de borda superior em superfícies elevadas

**Bordas como substitutas de sombra:**
Em vez de sombras complexas, a borda `1px solid var(--border-color)` delimita
cards e painéis. A borda forte (`border-color-strong`) é usada para estados
hover e foco.

---

## Glass Material System

Introduzido no Command Center v1.0. Define o sistema de superfícies translúcidas para dashboards imersivos onde múltiplas camadas de informação coexistem sobre um fundo atmosférico.

### Tokens glass

Adicionados ao `src/tokens/colors.css`:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-glass-surface` | `rgba(13,13,15,0.72)` | Painéis laterais e bottom bar |
| `--color-glass-header` | `rgba(17,17,19,0.88)` | Header bar (mais opaco, mais alto na hierarquia visual) |
| `--color-glass-detail` | `rgba(13,13,15,0.92)` | DetailPanel flutuante (quase opaco — leitura de dados) |
| `--color-glass-border` | `rgba(255,255,255,0.04)` | Divisores internos entre cards e slots |
| `--color-glass-shadow` | `rgba(139,26,26,0.12)` | Sombra com toque crimson para painéis flutuantes |

### Material unificado

Header, painéis laterais e bottom bar compartilham o mesmo "vidro escurecido":

```css
background: var(--color-glass-surface);   /* ou glass-header */
backdrop-filter: blur(10px);              /* 12px no header */
-webkit-backdrop-filter: blur(10px);
```

Não usar `border` para delimitar painéis. Usar fades de gradiente nos limites com o hero:

```css
/* Exemplo: fade lateral do painel esquerdo */
.left::after {
  content: '';
  position: absolute;
  top: 0; right: -64px; width: 64px; height: 100%;
  background: linear-gradient(to right, var(--color-glass-surface), transparent);
  pointer-events: none;
}
```

### Cards sem bordas

KPI cards e blocos de informação dentro dos painéis não têm `border` individual. Separação por:

1. Linha sutil `border-bottom: 1px solid var(--color-glass-border)` — apenas entre itens
2. Espaçamento generoso (`padding: var(--space-3) var(--space-2)`)
3. Hover discreto: `background: rgba(255,255,255,0.02)`

```css
.card {
  background: transparent;
  padding: var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--color-glass-border);
}
.card:last-child { border-bottom: none; }
.card:hover { background: rgba(255, 255, 255, 0.02); }
```

### DetailPanel glass-morphism

Painéis flutuantes de detalhe (hover sobre entidades 3D) usam `glass-detail`:

```css
background: var(--color-glass-detail);
border: 1px solid rgba(139, 26, 26, 0.15);
box-shadow:
  0 8px 32px rgba(0,0,0,0.6),
  0 0 0 1px rgba(255,255,255,0.03),
  inset 0 1px 0 rgba(255,255,255,0.04);
backdrop-filter: blur(16px);
```

Sem aspecto de modal: sem overlay, sem `border` dura, sombra serve como delimitador visual.

### Regras

- Nunca use `border` como separador de painel — use fade de gradiente ou ausência de borda.
- Nunca use `background` sólido em painéis que sobrepoêm o hero 3D — mantém a sensação de profundidade.
- `backdrop-filter: blur()` requer que o pai não tenha `overflow: hidden` ou `will-change: transform`.
- Em contextos sem suporte a `backdrop-filter`: `glass-surface` continua funcional por ter opacidade suficiente (0.72).

---

## Shapes

A linguagem de formas da Orison é definida por **austeridade geométrica**.
Não há bordas arredondadas expressivas. Os poucos raios permitidos existem
apenas para suavizar arestas tecnicamente — nunca como elemento de identidade.

| Token        | Valor  | Uso                                                  |
|--------------|--------|------------------------------------------------------|
| `rounded-none` | 0px  | Padrão: botões, inputs, cards, painéis, tabelas      |
| `rounded-sm`   | 2px  | Badges, tags e elementos muito pequenos              |
| `rounded-md`   | 4px  | Exceção funcional quando zero causa artefato visual  |
| `rounded-lg`   | 8px  | Nunca usado em componentes de UI padrão              |
| `rounded-full` | 9999px | Avatares circulares, indicadores de status ponto  |

**Regra:** Não misture cantos arredondados e cantos retos no mesmo layout.
Se um elemento do grupo usa `rounded-none`, todos os outros do mesmo nível
hierárquico devem usar `rounded-none`.

---

## Components

### Botões

Dois variantes: **Primary** e **Ghost**. Nenhum variante adicional deve ser
criado sem aprovação.

**Primary (`.btn-orison`):**
Ação principal. Fundo crimson, texto off-white, sem borda. Tipografia Label
(9px, uppercase, 5px tracking). Sem raio de borda.

| Estado    | Background      | Transform       |
|-----------|-----------------|-----------------|
| Default   | `crimson`       | —               |
| Hover     | `red`           | `translateY(-1px)` |
| Active    | `crimson`       | `translateY(0)` |
| Focus     | `crimson`       | 2px red outline, 3px offset |
| Disabled  | `crimson`       | `opacity: 0.35` |

**Ghost (`.btn-orison-ghost`):**
Ação secundária. Fundo transparente, borda `1px solid gray`, texto off-white.
Mesma tipografia do primary.

| Estado    | Background    | Borda         | Transform          |
|-----------|---------------|---------------|--------------------|
| Default   | transparente  | `gray`        | —                  |
| Hover     | transparente  | `offwhite`    | `translateY(-1px)` |
| Focus     | transparente  | `offwhite`    | 2px offwhite outline |
| Disabled  | transparente  | `gray`        | `opacity: 0.30`    |

**Regras de botões:**
- Um único botão Primary por tela ou por grupo de ação.
- Não use botão Primary para ações destrutivas — use Ghost com texto vermelho.
- Nunca crie variante colorida além de crimson/ghost.

---

### Badges

Quatro variantes semânticas. Todos usam tipografia Micro (8px, uppercase,
3px tracking), padding `4px 10px`, `rounded-sm`.

| Variante   | Contexto                        | Background                        | Cor do texto       |
|------------|---------------------------------|-----------------------------------|--------------------|
| `crimson`  | Destaque, "novo", status ativo  | `rgba(139,26,26,0.15)`            | `crimson-text`     |
| `alert`    | Atenção, aviso moderado         | `rgba(139,74,26,0.15)`            | `#E07840`          |
| `positive` | Sucesso, confirmação            | `rgba(26,92,46,0.15)`             | `#3AAA62`          |
| `neutral`  | Informativo, inativo            | `rgba(90,90,90,0.15)`             | `text-secondary`   |

---

### Input Fields

Tipografia Body (11px). Fundo `surface`. Borda `1px solid border-color`.
Largura máxima `320px`. Sem raio.

Label acima do input: Micro (8px, uppercase, 4px tracking).
Hint abaixo: Micro (8px, 2px tracking, `text-muted`).

| Estado    | Borda                | Notas                            |
|-----------|----------------------|----------------------------------|
| Default   | `border-color`       | —                                |
| Hover     | `gray`               | —                                |
| Focus     | `crimson`            | Sem outline externo adicional    |
| Error     | `red`                | Hint usa `crimson-text`          |
| Disabled  | `border-color`       | `opacity: 0.30`                  |

---

### KPI Cards

Quatro variantes (Simple, Spark, Ring, Metric). **v1.1:** o valor principal usa
`numeric-lg` — Montserrat 500 a 28px — não mais a display serifada. Rótulo em
Micro. Sem borda arredondada, sem borda própria.

```css
.value {
  font-family: var(--font-body);
  font-size: var(--value-lg);
  font-weight: var(--value-weight);   /* 500 */
  letter-spacing: var(--tracking-value);
  /* Ancorado à direita: o olho lê número pelas unidades. */
  width: 100%;
  text-align: right;
}
```

**Renderização numérica:**

```css
font-variant-numeric: tabular-nums lining-nums;
font-feature-settings: "lnum", "tnum";
```

Obrigatório em valores que **atualizam ao vivo** e em **colunas** de tabela. Em
número grande, isolado e estático, use figuras proporcionais — largura fixa por
dígito deixa "121" frouxo em display size.

**Estabilidade de layout:** `width: 100%` + `text-align: right`, não
`min-width` fixo. A v1.0 cravava `min-width: 140px`, o que quebrava abaixo de
400px de viewport. A âncora à direita dá a mesma estabilidade sem piso rígido.

**Anel de progresso (KpiRing):**

- O percentual é `value / target`, **clampado nos dois extremos**. Sem o piso,
  um valor negativo gera `strokeDasharray` negativo — declaração inválida que o
  browser descarta inteira, e o anel renderiza **completo**: um KPI negativo
  exibido como 100% de atingimento.
- O track do anel codifica o restante, então é conteúdo não-textual com
  exigência de 3:1. `border-color` (#2e2e2e, 1.4:1) não serve;
  use `--color-ring-track`.
- Um único encoding numérico por anel. A v1.0 imprimia o mesmo número duas
  vezes — 7px dentro do anel e 28px ao lado.

---

### Data Table

Cabeçalho: Label (8px, 4px tracking, uppercase), borda inferior `subtle`.
Células: Body (11px, 1px tracking), padding `14px 16px`, borda inferior thin.
Hover em linha: `rgba(255,255,255,0.02)`.

Variantes de célula:
- `.td-metric` — monospace, métricas numéricas
- `.td-positive` — cor `positive-md`
- `.td-negative` — cor `negative-md`
- `.td-muted` — cor `text-muted`

---

### Motion

Escala fechada de durações e seis curvas. Os tokens existem em duas cópias —
`src/tokens/motion.css` e `src/motion/constants.js` — porque WebGL e WAAPI não
leem custom properties. `assertMotionParity()` roda em dev e falha alto se as
duas divergirem.

| Token      | Duração | Uso                                    |
|------------|---------|----------------------------------------|
| `instant`  | 80ms    | Swap de valor ao vivo                  |
| `fast`     | 150ms   | Hover, cor, opacidade                  |
| `base`     | 250ms   | Transição de estado padrão             |
| `moderate` | 400ms   | Entrada de painel, reveal de barra     |
| `slow`     | 600ms   | Reveal de sparkline, arco de anel      |
| `dramatic` | 900ms   | Contagem de KPI no mount               |
| `exit`     | 150ms   | **Toda saída** — mais rápida que a entrada |

**Regras:**

- Nunca `transition: all`.
- **Saída mais rápida que entrada.** Os tokens `enter` e `exit` da v1.0 eram
  byte-idênticos, o que anulava o motivo de existirem dois.
- **`prefers-reduced-motion` não é um kill global.** Um override de `0.01s` em
  tudo destrói o feedback de estado junto com a decoração. A alternativa
  intencional: coreografia de entrada e loops decorativos somem
  (`animation-duration: 1ms`, `iteration-count: 1`); transições de **estado**
  sobrevivem comprimidas a 80ms.
- **CSS não alcança a camada 3D nem motion em JS.** Loops de `useFrame`,
  `requestAnimationFrame` e WAAPI precisam ler a preferência explicitamente —
  `usePrefersReducedMotion()`. Na v1.0 os quatro heroes tinham
  `reducedMotion = false` cravado no código, com toda a instrumentação já
  construída e ligada.
- **Animação 3D multiplica por `delta`.** Um `+= 0.002` por frame roda 2,4×
  mais rápido num monitor de 144Hz. Nunca cravar `0.016` como frame time.

## Do's and Don'ts

**Símbolo e Logotipo:**
- ✓ Mantenha a área de proteção = altura do símbolo ÷ 4 em todos os lados.
- ✓ Use sempre o arquivo SVG original — nunca recrie o símbolo manualmente.
- ✗ Não altere a cor do símbolo fora do par aprovado (off-white sobre escuro /
  midnight sobre claro).
- ✗ Não rotacione, distorça, aplique sombra ou efeito sobre o símbolo.
- ✗ Não use o símbolo abaixo de 16px sem remover o círculo interno.

**Cor:**
- ✓ Use crimson uma vez por tela, na ação mais importante.
- ✓ Mantenha contraste WCAG AA mínimo (4.5:1) — AA+ (5.5:1) para corpo.
- ✗ Não use crimson como cor de fundo de superfície ampla.
- ✗ Não crie novas cores fora da paleta sem aprovação.
- ✗ Não aplique `opacity` sobre texto para criar variações de cor — use a cor
  correta da escala.

**Tipografia:**
- ✓ Use Cormorant para editorial e identidade; Montserrat para interface,
  dados técnicos e **todo valor numérico**.
- ✓ Letras maiúsculas apenas em labels e micro — nunca em parágrafos.
- ✓ Escala em `rem`; tracking em `em`.
- ✗ **Nunca abaixo de 10px** — nem para glifo decorativo.
- ✗ Não aplique `font-size` no `html` junto de uma escala em rem.
- ✗ Não use mais de dois pesos tipográficos em uma peça.
- ✗ Não substitua as famílias por fontes do sistema.
- ✗ Não use `tabular-nums` em número grande e isolado (exceto valor ao vivo).

**Layout:**
- ✓ Use espaçamentos sempre em múltiplos de 8px (ou 4px para micro-ajuste).
- ✓ Respeite a largura máxima de 1080px para todo conteúdo principal.
- ✗ Não quebre o ritmo de 8px com valores arbitrários (ex.: 15px, 22px).
- ✗ Não misture cantos arredondados e cantos retos no mesmo grupo de elementos.

**Voz:**
- ✓ Escreva com precisão cirúrgica — frases curtas, sem ambiguidade.
- ✓ Prefira substantivos de resultado: *precisão*, *transformação*, *resultado*.
- ✗ Não use *inovação*, *disruptivo*, *ecossistema*, *solução*, *plataforma*,
  *sinérgico*, *holístico*, *alavancar*.
- ✗ Não personifique a Orison como assistente ou "ajudante" — a Orison opera,
  não serve.

---

## Voice & Tone

A Orison comunica como um organismo que age — não como um produto que aguarda
instruções. A voz reflete a premissa central: **transformação operacional por
meio de inteligência estrutural**.

**A Orison É:**
- **Calculada** — cada palavra e cada pixel carregam intenção.
- **Precisa** — sem ambiguidade, sem eufemismo, sem rodeios.
- **Sóbria** — nunca excessivamente entusiasmada ou emocional.
- **Inevitável** — comunica como se o resultado já estivesse decidido.
- **Direta** — vai ao ponto sem jargão de marketing.

**A Orison Nunca É:**
- Animada ou jovial (sem exclamações, sem emoji em contextos formais).
- Humilde em excesso (sem "tentamos", "esperamos que", "acreditamos que").
- Técnica demais (sem acrônimos não explicados, sem jargão de engenharia em
  copy de negócio).
- Genérica (sem clichês de tecnologia ou de consultoria).
- Reativa (nunca responde a críticas com defesa — age com demonstração).

**Vocabulário aprovado:**
Precisão · Resultado · Transformação · Organismo · Estrutura · Inteligência ·
Operação · Velocidade · Clareza · Decisão · Processo · Escala

**Vocabulário proibido:**
Inovação · Disruptivo · Ecossistema · Solução · Plataforma · Sinérgico ·
Holístico · Alavancar · Empoderar · Jornada · User-centric · Best-in-class

**Exemplo correto:**
> "A Orison mapeia cada processo da sua operação e elimina o atrito antes que
> ele vire custo."

**Exemplo incorreto:**
> "Acreditamos que nossa plataforma inovadora pode ajudar sua empresa a
> alavancar resultados de forma holística."

---

## Applications

Os templates de aplicação são a expressão da identidade em contextos reais.
Todos os templates seguem os mesmos tokens e não podem ser alterados
estruturalmente sem revisão do sistema.

**Cartão de Visita (85mm × 55mm):**
- Frente: fundo black, símbolo no topo esquerdo + divisor vertical slate +
  wordmark horizontal (Cormorant 26px, loose tracking) + subtítulo crimson.
  Verso: fundo off-white, mesmo lockup em midnight, nome e cargo à direita.
- Nome: Display SM, off-white (frente) / midnight (verso).
- Cargo: Label, `text-secondary`.
- Contato: Micro, `text-muted`.

**Assinatura de E-mail:**
- Estrutura: símbolo 36px + barra crimson esquerda + bloco de texto.
- Nome: Cormorant 17px Regular, crimson-text.
- Cargo: Label uppercase, `text-secondary`.
- Divisor: 1px slate.
- Contato: Micro, `text-muted`, stack vertical.

**Slide Cover (16:9):**
- Fundo: black.
- Barra crimson: 3px, borda esquerda, altura total.
- Conteúdo: eyebrow (Label, crimson-text) + título (Display LG, offwhite) +
  subtítulo (Body, `text-secondary`).
- Logotipo: canto inferior direito, lockup horizontal pequeno.
- Decoração: símbolo em background opacity-decoration (5%).

**Capa de Proposta (A4 vertical):**
- Fundo: midnight.
- Topo: lockup vertical.
- Meio: divisor crimson (32px largura, 1px) + título da proposta (Display MD).
- Base: nome do cliente (Display XS) + data (Label, `text-muted`).
- Decoração: símbolo em background opacity-decoration.

**Banner LinkedIn (1584 × 396px):**
- Fundo: black.
- Esquerda: lockup horizontal (símbolo + divisor + wordmark).
- Centro-direita: tagline (Label uppercase, `text-secondary`).
- Decoração: símbolo à direita em opacity-decoration.
