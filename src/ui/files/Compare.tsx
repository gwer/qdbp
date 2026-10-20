import { useEffect, useState } from 'preact/hooks';
import type { T } from '@/i18n/t';

/**
 * Сравнение «до / после» шторкой: результат поверх исходника, ползунок открывает его слева направо.
 * В натуральную величину артефакты сжатия видно лучше, чем на уменьшенной картинке.
 */
export function Compare({ file, after, t, onClose }: { file: File; after: string; t: T; onClose: () => void }) {
  const [before, setBefore] = useState<string | null>(null);
  const [pos, setPos] = useState(50);
  const [actual, setActual] = useState(false);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setBefore(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (!before) return null;
  return (
    <div class="compare">
      <div class={actual ? 'compare-view compare-actual' : 'compare-view'}>
        <div class="compare-stack">
          <img src={before} alt={t('files.before')} />
          <img src={after} alt={t('files.after')} style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />
          <i class="compare-line" style={{ left: `${pos}%` }} />
          <span class="compare-tag" style={{ left: '6px' }}>
            {t('files.before')}
          </span>
          <span class="compare-tag" style={{ right: '6px' }}>
            {t('files.after')}
          </span>
        </div>
      </div>
      <input type="range" min={0} max={100} value={pos} aria-label={t('files.compare')} onInput={(e) => setPos(Number(e.currentTarget.value))} />
      <div class="actions">
        <label class="checks">
          <input type="checkbox" checked={actual} onChange={() => setActual(!actual)} /> {t('files.actualSize')}
        </label>
        <button type="button" class="btn btn-secondary btn-small" onClick={onClose}>
          {t('files.closeCompare')}
        </button>
      </div>
    </div>
  );
}
