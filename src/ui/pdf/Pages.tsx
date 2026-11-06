import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { T } from '@/i18n/t';
import { ChevronLeft, ChevronRight, RotateCcw, RotateCw, Trash, Undo } from './icons';
import type { PDFDocumentProxy } from './pdfjs';
import { thumbnail } from './source';

/** Миниатюра страницы (index с 0). Рисуется, когда попадает в видимую область. rotate — дополнительный поворот. */
export function Thumb({ doc, index, rotate = 0, alt = '' }: { doc: PDFDocumentProxy; index: number; rotate?: number; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setUrl(null);
    setFailed(false);
    let alive = true;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        thumbnail(doc, index).then(
          (u) => alive && setUrl(u),
          () => alive && setFailed(true),
        );
      },
      { rootMargin: '300px' },
    );
    io.observe(box.current!);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [doc, index]);
  return (
    <div class={failed ? 'pdf-thumb pdf-thumb-failed' : 'pdf-thumb'} ref={box}>
      {url && <img src={url} alt={alt} style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined} draggable={false} />}
    </div>
  );
}

export interface PageItem {
  key: string;
  doc: PDFDocumentProxy;
  /** Номер страницы в исходном документе, с 0. */
  index: number;
  /** Дополнительный поворот, кратный 90. */
  rotate: number;
  /** Отмечена к удалению: показывается бледной, в результат не попадает. */
  removed?: boolean;
  /** Отмечена (выбор страниц). */
  selected?: boolean;
}

/** Перенос элемента from на место перед to (to может быть равен длине — в конец). */
export function move<V>(list: V[], from: number, to: number): V[] {
  if (from === to || from + 1 === to) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to > from ? to - 1 : to, 0, item);
  return next;
}

/**
 * Сетка миниатюр страниц. Перестановка — перетаскиванием или стрелками, поворот, удаление (с отменой),
 * выбор щелчком. Какие действия доступны — решает инструмент.
 * Строки: pdf.page, pdf.rotateLeft, pdf.rotateRight, pdf.remove, pdf.restore, pdf.moveLeft, pdf.moveRight.
 */
export function PageGrid({
  t,
  items,
  onChange,
  reorder,
  rotate,
  remove,
  select,
  label,
  badge,
}: {
  t: T;
  items: PageItem[];
  onChange: (items: PageItem[]) => void;
  reorder?: boolean;
  rotate?: boolean;
  remove?: boolean;
  /** Щелчок по миниатюре отмечает страницу. */
  select?: boolean;
  /** Подпись под миниатюрой (по умолчанию — номер страницы в исходнике). */
  label?: (item: PageItem, position: number) => string;
  /** Метка поверх миниатюры (например, номер файла при разделении). */
  badge?: (item: PageItem, position: number) => ComponentChildren;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const update = (i: number, patch: Partial<PageItem>) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const turn = (i: number, by: number) => update(i, { rotate: (items[i].rotate + by + 360) % 360 });

  return (
    <ol class={select ? 'pdf-grid pdf-grid-select' : 'pdf-grid'}>
      {items.map((it, i) => {
        const page = t('pdf.page', { n: it.index + 1 });
        const cls = ['pdf-card', it.removed && 'pdf-removed', it.selected && 'pdf-selected', dragging === i && 'pdf-dragging', target === i && 'pdf-drop-before', target === items.length && i === items.length - 1 && 'pdf-drop-after']
          .filter(Boolean)
          .join(' ');
        return (
          <li
            key={it.key}
            class={cls}
            draggable={reorder}
            onDragStart={(e) => {
              setDragging(i);
              e.dataTransfer!.effectAllowed = 'move';
              e.dataTransfer!.setData('text/plain', String(i));
            }}
            onDragEnd={() => {
              setDragging(null);
              setTarget(null);
            }}
            onDragOver={(e) => {
              if (dragging === null) return;
              e.preventDefault();
              const r = e.currentTarget.getBoundingClientRect();
              setTarget(e.clientX > r.left + r.width / 2 ? i + 1 : i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging !== null && target !== null) onChange(move(items, dragging, target));
              setDragging(null);
              setTarget(null);
            }}
          >
            {select ? (
              <button type="button" class="pdf-pick" aria-pressed={!!it.selected} onClick={() => update(i, { selected: !it.selected })}>
                <Thumb doc={it.doc} index={it.index} rotate={it.rotate} alt={page} />
              </button>
            ) : (
              <Thumb doc={it.doc} index={it.index} rotate={it.rotate} alt={page} />
            )}
            {badge && badge(it, i) != null && <span class="pdf-badge">{badge(it, i)}</span>}
            <span class="pdf-label">{label ? label(it, i) : it.index + 1}</span>
            {(reorder || rotate || remove) && (
              <span class="pdf-tools">
                {reorder && (
                  <button type="button" class="pdf-icon" title={t('pdf.moveLeft')} aria-label={`${t('pdf.moveLeft')}: ${page}`} disabled={i === 0} onClick={() => onChange(move(items, i, i - 1))}>
                    <ChevronLeft />
                  </button>
                )}
                {rotate && (
                  <button type="button" class="pdf-icon" title={t('pdf.rotateLeft')} aria-label={`${t('pdf.rotateLeft')}: ${page}`} onClick={() => turn(i, -90)}>
                    <RotateCcw />
                  </button>
                )}
                {rotate && (
                  <button type="button" class="pdf-icon" title={t('pdf.rotateRight')} aria-label={`${t('pdf.rotateRight')}: ${page}`} onClick={() => turn(i, 90)}>
                    <RotateCw />
                  </button>
                )}
                {remove && (
                  <button
                    type="button"
                    class="pdf-icon"
                    title={t(it.removed ? 'pdf.restore' : 'pdf.remove')}
                    aria-label={`${t(it.removed ? 'pdf.restore' : 'pdf.remove')}: ${page}`}
                    onClick={() => update(i, { removed: !it.removed })}
                  >
                    {it.removed ? <Undo /> : <Trash />}
                  </button>
                )}
                {reorder && (
                  <button
                    type="button"
                    class="pdf-icon"
                    title={t('pdf.moveRight')}
                    aria-label={`${t('pdf.moveRight')}: ${page}`}
                    disabled={i === items.length - 1}
                    onClick={() => onChange(move(items, i, i + 2))}
                  >
                    <ChevronRight />
                  </button>
                )}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Страницы документа как элементы сетки. */
export const pagesOf = (doc: PDFDocumentProxy, count: number, prefix = ''): PageItem[] =>
  Array.from({ length: count }, (_, index) => ({ key: `${prefix}${index}`, doc, index, rotate: 0 }));
