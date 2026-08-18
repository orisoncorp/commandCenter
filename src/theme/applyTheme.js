import { retargetHeroColors } from '../heroes/palette';

/**
 * Aplica o bloco `theme` do config como custom properties no :root.
 *
 * Sem isto o config controlava layout mas não identidade — todo cliente
 * receberia crimson Orison, e o runbook de migração não tinha onde plugar a
 * marca do cliente. É a lacuna que separava "template verticalizável" de
 * "template com um único visual".
 *
 * Só chaves conhecidas são aplicadas: um config não injeta CSS arbitrário.
 */

// chave do config -> custom property de destino
const TOKEN_MAP = {
  accent: '--color-crimson',
  accentHover: '--color-red',
  accentText: '--color-crimson-text',
  dataPrimary: '--color-data-primary',
  surface: '--color-surface',
  surfaceDeep: '--color-black',
  surfaceRaised: '--color-midnight',
  textPrimary: '--color-text-primary',
  textBody: '--color-text-body',
  textSecondary: '--color-text-secondary',
  textMuted: '--color-text-muted',
  positive: '--color-positive',
  alert: '--color-alert',
  negative: '--color-negative',
  fontDisplay: '--font-display',
  fontBody: '--font-body',
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function hexToRgbChannels(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function applyTheme(theme) {
  if (!theme || typeof theme !== 'object') return;
  const root = document.documentElement;

  for (const [key, value] of Object.entries(theme)) {
    const prop = TOKEN_MAP[key];
    if (!prop || typeof value !== 'string') continue;
    root.style.setProperty(prop, value);

    // O acento também alimenta o canal RGB, usado por rgb(var(--x) / <a>).
    if (key === 'accent' && HEX.test(value)) {
      root.style.setProperty('--color-crimson-rgb', hexToRgbChannels(value));
    }
  }

  // A camada 3D não lê custom properties — precisa ser retargetada em JS.
  retargetHeroColors(themeHeroColors(theme));
}

/** Cores da camada 3D derivadas do tema — WebGL não lê custom properties. */
export function themeHeroColors(theme = {}) {
  const out = {};
  if (theme.accent) out.crimson = theme.accent;
  if (theme.accentText) out.crimsonBright = theme.accentText;
  if (theme.dataPrimary) {
    out.dataPoint = theme.dataPrimary;
    // O sweep do radar acompanha a tinta de dado: é a marca mais proeminente
    // do Globe e precisa ler como parte do mesmo sistema.
    out.sweep = theme.dataPrimary;
  }
  if (theme.surfaceDeep) out.background = theme.surfaceDeep;
  return out;
}
