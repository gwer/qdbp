import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lang } from '@/i18n/config';
import { formatCompact } from '@/lib/format';

export interface ChartSeries {
  label: string;
  values: number[];
}

/**
 * Простой SVG-график без библиотек: столбцы с накоплением (bars) или линии (lines).
 * Цвета — .chart-s0…s2 в global.css. Значения по точке видны при наведении или касании;
 * точные числа всё равно есть в таблице рядом, поэтому сам график для чтения с экрана — одна подпись (label).
 */
export function Chart({
  kind,
  x,
  series,
  lang,
  label,
  format,
  totalLabel,
}: {
  kind: 'bars' | 'lines';
  /** Подписи точек по оси X (годы, месяцы). */
  x: string[];
  series: ChartSeries[];
  lang: Lang;
  label: string;
  /** Полная запись значения для подсказки. */
  format: (n: number) => string;
  /** Подпись суммы столбца в подсказке (для bars). */
  totalLabel?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  // До измерения рисуем в 600 px и растягиваем viewBox; после — в реальных пикселях, чтобы текст не масштабировался.
  const [width, setWidth] = useState(600);
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setWidth(Math.max(240, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = x.length;
  const height = 220;
  const pad = { top: 10, right: 8, bottom: 22, left: 8 };
  const totals = x.map((_, i) =>
    kind === 'bars' ? series.reduce((s, ser) => s + Math.max(0, ser.values[i] ?? 0), 0) : Math.max(...series.map((s) => s.values[i] ?? 0)),
  );
  const ticks = niceTicks(Math.max(0, ...totals));
  const max = ticks[ticks.length - 1];
  const tickLabels = ticks.map((v) => formatCompact(lang, v));
  // Подписи оси Y — над линиями сетки слева, место под них не резервируем.
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const step = plotW / Math.max(1, n);
  const xAt = (i: number) => pad.left + step * (i + 0.5);
  const yAt = (v: number) => pad.top + plotH - (max ? (v / max) * plotH : 0);
  // Подписи X не налезают друг на друга: ширина оценивается по самой длинной (≈ 6,5 px на символ).
  const labelWidth = Math.max(...x.map((l) => l.length)) * 6.5 + 10;
  const every = Math.max(1, Math.ceil(labelWidth / step));

  const pick = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    const i = Math.floor(((clientX - r.left) * (width / r.width) - pad.left) / step);
    setActive(i >= 0 && i < n ? i : null);
  };

  return (
    <figure class="chart" ref={box}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label={label}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
      >
        {ticks.map((v, k) => (
          <g key={k}>
            <line class="chart-grid" x1={pad.left} x2={width - pad.right} y1={yAt(v)} y2={yAt(v)} />
            {k > 0 && (
              <text class="chart-tick" x={pad.left + 2} y={yAt(v) - 3}>
                {tickLabels[k]}
              </text>
            )}
          </g>
        ))}
        {active !== null && <rect class="chart-hover" x={xAt(active) - step / 2} y={pad.top} width={step} height={plotH} />}
        {kind === 'bars'
          ? x.map((_, i) => {
              let acc = 0;
              const w = Math.max(1, Math.min(56, step * 0.7));
              return (
                <g key={i}>
                  {series.map((s, k) => {
                    const v = Math.max(0, s.values[i] ?? 0);
                    const y0 = yAt(acc);
                    acc += v;
                    return <rect key={k} class={`chart-s${k}`} x={xAt(i) - w / 2} y={yAt(acc)} width={w} height={Math.max(0, y0 - yAt(acc))} />;
                  })}
                </g>
              );
            })
          : series.map((s, k) => (
              <polyline
                key={k}
                class={`chart-line chart-s${k}`}
                points={s.values.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ')}
              />
            ))}
        {x.map((t, i) =>
          i % every === 0 ? (
            <text key={i} class="chart-x" x={xAt(i)} y={height - 6}>
              {t}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption class="chart-legend">
        {series.map((s, k) => (
          <span key={k}>
            <i class={`chart-s${k}`} />
            {s.label}
          </span>
        ))}
      </figcaption>
      {active !== null && (
        <div class="chart-tip" style={{ [xAt(active) > width / 2 ? 'right' : 'left']: `${xAt(active) > width / 2 ? width - xAt(active) + step / 2 : xAt(active) + step / 2}px` }}>
          <b>{x[active]}</b>
          {series.map((s, k) => (
            <span key={k}>
              <i class={`chart-s${k}`} />
              {s.label}: {format(s.values[active] ?? 0)}
            </span>
          ))}
          {totalLabel && (
            <span>
              {totalLabel}: {format(totals[active])}
            </span>
          )}
        </div>
      )}
    </figure>
  );
}

/** Деления оси: шаг 1, 2 или 5 × 10^k, не больше пяти интервалов, последнее — не меньше максимума. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  let step = 10 ** Math.floor(Math.log10(max / 5));
  for (const m of [1, 2, 5, 10]) {
    if (max / (m * step) <= 5) {
      step *= m;
      break;
    }
  }
  const count = Math.ceil(max / step - 1e-9);
  return Array.from({ length: count + 1 }, (_, k) => k * step);
}
