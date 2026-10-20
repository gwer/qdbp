/**
 * Цветная шкала с отметкой значения: ИМТ, процент жира и т. п.
 * bands — отрезки по порядку: верхняя граница (у последнего — конец шкалы), подпись и тон.
 * Тона — .scale-low … .scale-worst в global.css.
 */
export interface ScaleBand {
  to: number;
  label: string;
  tone: 'low' | 'good' | 'warn' | 'bad' | 'worse' | 'worst';
}

export function Scale({
  min,
  bands,
  value,
  label,
  format,
}: {
  min: number;
  bands: ScaleBand[];
  value: number;
  /** Подпись для чтения с экрана: «ИМТ 22,9 — нормальный вес». */
  label: string;
  format: (n: number) => string;
}) {
  const max = bands[bands.length - 1].to;
  const pos = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100;
  let from = min;
  return (
    <div class="scale" role="img" aria-label={label}>
      <div class="scale-bar">
        {bands.map((b) => {
          const left = pos(from);
          from = b.to;
          return <span key={b.label} class={`scale-${b.tone}`} style={{ left: `${left}%`, width: `${pos(b.to) - left}%` }} title={b.label} />;
        })}
        <i class="scale-mark" style={{ left: `${pos(value)}%` }} />
      </div>
      <div class="scale-ticks" aria-hidden="true">
        {bands.slice(0, -1).map((b) => (
          <span key={b.label} style={{ left: `${pos(b.to)}%` }}>
            {format(b.to)}
          </span>
        ))}
      </div>
      <div class="scale-legend" aria-hidden="true">
        {bands.map((b) => (
          <span key={b.label}>
            <i class={`scale-${b.tone}`} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
