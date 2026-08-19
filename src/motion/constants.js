// Espelho JS dos tokens de motion.
//
// CSS custom properties não são legíveis por JS sem getComputedStyle, e o
// projeto não tem build step de tokens — então os dois lados coexistem. O que
// mudou: antes eles concordavam por sorte e nada garantia isso. Agora
// `assertMotionParity()` roda em dev e falha alto se divergirem.

export const EASING = {
  enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
  // Saída mais rápida que entrada — a assimetria é o motivo de existirem dois
  // tokens. Antes `exit` era byte-idêntico a `enter`.
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  state: 'cubic-bezier(0.4, 0, 0.2, 1)',
  emphasis: 'cubic-bezier(0.16, 1, 0.3, 1)',
  linear: 'linear',
  micro: 'cubic-bezier(0, 0, 0.2, 1)',
};

export const DURATION = {
  instant: 80,
  fast: 150,
  base: 250,
  moderate: 400,
  slow: 600,
  dramatic: 900,
  cinematic: 1400,
  exit: 150,
};

export const STAGGER = {
  base: 60,
  dense: 40,
  dramatic: 120,
  decay: 0.9,
  maxItems: 8,
  maxDelay: 480,
};

export function calcStaggerDelay(index, base = STAGGER.base, decay = STAGGER.decay) {
  if (index >= STAGGER.maxItems) return STAGGER.maxDelay;
  let total = 0;
  for (let i = 0; i < index; i++) total += base * Math.pow(decay, i);
  return Math.min(total, STAGGER.maxDelay);
}

/**
 * Verifica, em dev, que o espelho JS e as custom properties do CSS ainda
 * concordam. Sem isto, uma edição em qualquer um dos lados dessincroniza os
 * dois em silêncio.
 */
export function assertMotionParity() {
  if (typeof window === 'undefined' || !import.meta.env?.DEV) return;
  const cs = getComputedStyle(document.documentElement);
  const drift = [];

  for (const [k, v] of Object.entries(EASING)) {
    const css = cs.getPropertyValue(`--motion-easing-${k}`).trim();
    if (css && css.replace(/\s/g, '') !== v.replace(/\s/g, '')) {
      drift.push(`easing.${k}: js="${v}" css="${css}"`);
    }
  }
  for (const [k, v] of Object.entries(DURATION)) {
    const css = cs.getPropertyValue(`--motion-duration-${k}`).trim();
    if (css && parseFloat(css) !== v) drift.push(`duration.${k}: js=${v} css="${css}"`);
  }

  if (drift.length) {
    console.error('[motion] tokens CSS e JS divergiram:\n  ' + drift.join('\n  '));
  }
}
