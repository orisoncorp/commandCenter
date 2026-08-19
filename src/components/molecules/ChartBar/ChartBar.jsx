import { useState, useMemo, useId } from 'react';
import styles from './ChartBar.module.css';
import Label from '../../atoms/Label/Label';
import { calcStaggerDelay, STAGGER } from '../../../motion/constants';
import { formatCompact } from '../../../data/format';

const W = 240;
const H = 120;
const PAD_L = 34;   // faixa dos rótulos do eixo Y
const PAD_R = 4;
const PAD_T = 10;
const PAD_B = 22;   // faixa dos rótulos do eixo X — precisa caber DENTRO do container
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const MAX_BAR_W = 24;   // barras finas; a folga da faixa vira ar
const BAR_GAP = 2;      // separação é feita por vão na cor da superfície
const RADIUS = 4;       // topo arredondado, base quadrada

// Ticks em números redondos — 0 / 100 / 200, nunca 0 / 137 / 274.
function niceTicks(max, count = 4) {
  if (!(max > 0)) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  // Passo em {1,2,5,10}×magnitude, escolhido pelo menor que cobre `raw`.
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const ticks = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(v);
  return ticks;
}

// Barra com topo arredondado e base reta. `rx` num <rect> arredondaria os
// quatro cantos, incluindo os da baseline.
function barPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, Math.max(h, 0));
  if (h <= 0) return '';
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

export default function ChartBar({ label, data = [], format = 'number' }) {
  const [hover, setHover] = useState(null);
  const titleId = useId();

  // Um único valor `undefined` fazia Math.max devolver NaN e apagava o chart
  // inteiro. Pontos inválidos agora são descartados, não propagados.
  const points = useMemo(
    () => data.filter(d => d && Number.isFinite(d.value)),
    [data]
  );

  const { maxVal, ticks, slot, barW } = useMemo(() => {
    const max = points.length ? Math.max(...points.map(d => d.value), 0) : 0;
    const t = niceTicks(max);
    const axisMax = Math.max(t[t.length - 1] || 0, max, 1);
    const s = points.length ? PLOT_W / points.length : PLOT_W;
    return {
      maxVal: axisMax,
      ticks: t,
      slot: s,
      barW: Math.max(2, Math.min(MAX_BAR_W, s - BAR_GAP * 2)),
    };
  }, [points]);

  if (!points.length) {
    return (
      <div className={styles.wrap}>
        {label && <Label>{label}</Label>}
        <p className={styles.empty}>Sem dados no período.</p>
      </div>
    );
  }

  const baseY = PAD_T + PLOT_H;
  const fmt = v => (format === 'currency' ? `R$ ${formatCompact(v)}` : formatCompact(v));

  return (
    <div className={styles.wrap}>
      {label && <Label id={titleId}>{label}</Label>}

      <div className={styles.plot}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-labelledby={titleId}>
          {/* Grid: hairline sólido, um passo acima da superfície. Nunca tracejado. */}
          {ticks.map(t => {
            const y = baseY - (t / maxVal) * PLOT_H;
            return (
              <g key={t}>
                <line
                  x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                  stroke="var(--color-chart-grid)"
                  strokeWidth="1"
                  shapeRendering="crispEdges"
                />
                <text
                  x={PAD_L - 6} y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className={styles.axisLabel}
                >
                  {formatCompact(t)}
                </text>
              </g>
            );
          })}

          {points.map((d, i) => {
            const h = Math.max(0, (d.value / maxVal) * PLOT_H);
            const x = PAD_L + slot * i + (slot - barW) / 2;
            const isHovered = hover?.i === i;
            return (
              <g key={d.label ?? i}>
                <path
                  d={barPath(x, baseY - h, barW, h, RADIUS)}
                  fill={isHovered ? 'var(--color-crimson-text)' : 'var(--color-data-primary)'}
                  className={styles.bar}
                  style={{
                    transformOrigin: `${x + barW / 2}px ${baseY}px`,
                    animationDelay: `${calcStaggerDelay(i, STAGGER.base)}ms`,
                  }}
                />
                {/* Alvo de acerto cobrindo a faixa inteira — uma barra de 18px
                    de largura é pequena demais para mirar. */}
                <rect
                  x={PAD_L + slot * i} y={PAD_T}
                  width={slot} height={PLOT_H}
                  fill="transparent"
                  onPointerEnter={() => setHover({ i, d })}
                  onPointerLeave={() => setHover(null)}
                />
              </g>
            );
          })}

          {points.map((d, i) => (
            <text
              key={d.label ?? i}
              x={PAD_L + slot * i + slot / 2}
              y={H - 8}
              textAnchor="middle"
              className={styles.axisLabel}
            >
              {d.label}
            </text>
          ))}
        </svg>

        {hover && (
          <div
            className={styles.tooltip}
            style={{ left: `${((PAD_L + slot * hover.i + slot / 2) / W) * 100}%` }}
            role="status"
          >
            <span className={styles.tipLabel}>{hover.d.label}</span>
            <span className={styles.tipValue}>{fmt(hover.d.value)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
