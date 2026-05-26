export const EASING = {
  enter: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  exit: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  state: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
  emphasis: 'cubic-bezier(0.16, 1, 0.3, 1)',
  linear: 'linear',
  micro: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
};

export const DURATION = {
  instant: 80,
  fast: 150,
  base: 250,
  moderate: 400,
  slow: 600,
  dramatic: 900,
  cinematic: 1400,
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
  for (let i = 0; i < index; i++) {
    total += base * Math.pow(decay, i);
  }
  return Math.min(total, STAGGER.maxDelay);
}
