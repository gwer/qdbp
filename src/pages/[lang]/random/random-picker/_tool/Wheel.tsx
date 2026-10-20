/** До стольких вариантов подписи на колесе читаются; больше — колесо не показывается. */
export const WHEEL_MAX = 40;
export const SPIN_MS = 4200;
const R = 150;

/** Сектор от угла a до b (градусы, 0 — вверх, по часовой стрелке). */
function sector(a: number, b: number): string {
  const p = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(R + R * Math.cos(rad)).toFixed(2)} ${(R + R * Math.sin(rad)).toFixed(2)}`;
  };
  return `M${R} ${R} L${p(a)} A${R} ${R} 0 ${b - a > 180 ? 1 : 0} 1 ${p(b)} Z`;
}

/** Угол поворота, при котором центр сектора winner из n окажется под указателем (сверху), плюс 5 полных оборотов. */
export function spinTo(angle: number, winner: number, n: number): number {
  const center = (winner + 0.5) * (360 / n);
  return angle + 5 * 360 + ((((-center - angle) % 360) + 360) % 360);
}

/** Цвет сектора: шесть по кругу; последний не должен совпасть с первым соседом. */
const color = (i: number, n: number) => (n % 6 === 1 && i === n - 1 && n > 1 ? 2 : i % 6);

const short = (s: string) => (Array.from(s).length > 18 ? `${Array.from(s).slice(0, 17).join('')}…` : s);

/** Колесо фортуны. Победителя выбирает родитель (честным генератором) и докручивает колесо до него через angle. */
export function Wheel({ items, angle, spinning, preview, label }: { items: string[]; angle: number; spinning: boolean; preview: boolean; label: string }) {
  const n = items.length;
  const step = 360 / n;
  return (
    <div class={preview ? 'wheel wheel-preview' : 'wheel'}>
      <svg viewBox={`0 0 ${2 * R} ${2 * R}`} role="img" aria-label={label}>
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: '50% 50%',
            transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.85, 0.25, 1)` : 'none',
          }}
        >
          {items.map((item, i) => (
            <g key={i}>
              <path d={n === 1 ? `M${R} 0 A${R} ${R} 0 1 1 ${R - 0.01} 0 Z` : sector(i * step, (i + 1) * step)} class={`wheel-s${color(i, n)}`} />
              <text x={R + R * 0.56} y={R} dy="0.35em" transform={`rotate(${(i + 0.5) * step - 90} ${R} ${R})`} class="wheel-text" font-size={n > 24 ? 9 : n > 12 ? 11 : 13}>
                {short(item)}
              </text>
            </g>
          ))}
        </g>
        <circle cx={R} cy={R} r={14} class="wheel-hub" />
        <path d={`M${R - 11} 0 L${R + 11} 0 L${R} 26 Z`} class="wheel-pointer" />
      </svg>
    </div>
  );
}
