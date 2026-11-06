import { useEffect, useRef, useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { ChevronLeft, ChevronRight, X } from '@/ui/pdf/icons';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { openPdf, pdfName, saveBlob } from '@/ui/pdf/pdflib';
import { renderPage } from '@/ui/pdf/pdfjs';
import { Result, type OutFile } from '@/ui/pdf/Result';
import type { PdfSource } from '@/ui/pdf/source';
import { drawPicture, pageBox, shownSize } from '@/ui/pdf/stamp';
import { SignaturePad, type Signature } from './SignaturePad';
import { useJob } from '@/ui/pdf/useJob';

/** Подпись или дата на странице: доли видимой страницы (левый верхний угол и ширина). */
interface Placed {
  id: number;
  image: Signature;
  page: number;
  x: number;
  y: number;
  w: number;
}

let nextId = 1;

/** Дата как картинка: так она выглядит одинаково на любом языке и в любом шрифте. */
async function dateImage(text: string): Promise<Signature> {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  const font = '96px Helvetica, Arial, sans-serif';
  ctx.font = font;
  c.width = Math.ceil(ctx.measureText(text).width) + 16;
  c.height = 130;
  ctx.font = font;
  ctx.fillStyle = '#111111';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 8, 65);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'));
  if (!blob) throw new Error('date');
  return { png: new Uint8Array(await blob.arrayBuffer()), url: URL.createObjectURL(blob), width: c.width, height: c.height };
}

/** Страница для расстановки: картинка страницы и её видимый размер в пунктах. */
function usePage(source: PdfSource | null, index: number) {
  const [state, setState] = useState<{ source: PdfSource; index: number; url: string; width: number; height: number } | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!source) return;
    let alive = true;
    let url = '';
    setFailed(false);
    (async () => {
      const page = await source.doc.getPage(index + 1);
      const vp = page.getViewport({ scale: 1 });
      const canvas = await renderPage(page, { maxSide: 1400 });
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
      if (!alive || !blob) return;
      url = URL.createObjectURL(blob);
      setState({ source, index, url, width: vp.width, height: vp.height });
    })().catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [source, index]);
  // Пока рисуется новая страница, старая не считается загруженной: размеры и картинка — от неё.
  return { page: state && state.source === source && state.index === index ? state : null, failed };
}

export function SignPdf({ lang, t }: ToolProps) {
  usePreload();
  const job = useJob();
  const [source, setSource] = useState<PdfSource | null>(null);
  const [sig, setSig] = useState<Signature | null>(null);
  const [making, setMaking] = useState(false);
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<OutFile | null>(null);
  const view = useRef<HTMLDivElement>(null);
  const { page, failed: pageFailed } = usePage(source, index);

  const total = source?.pageCount ?? 0;
  const change = (next: Placed[]) => {
    job.cancel();
    setBusy(false);
    setPlaced(next);
    setResult(null);
    setFailed(false);
  };

  const add = (image: Signature) => {
    if (!page) return;
    // По умолчанию подпись шириной 45 мм, дата — высотой 18 пт (кегль около 12), в правой нижней четверти страницы.
    const w = Math.min(0.5, image === sig ? 128 / page.width : (image.width / image.height) * (18 / page.width));
    const h = (w * page.width * image.height) / image.width / page.height;
    change([...placed, { id: nextId++, image, page: index, x: Math.max(0, 0.62 - w / 2), y: Math.min(1 - h, 0.78), w }]);
  };

  /** Перетаскивание (move) или изменение размера (resize) мышью и пальцем. */
  const drag = (e: PointerEvent, item: Placed, kind: 'move' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    const rect = view.current!.getBoundingClientRect();
    const start = { cx: e.clientX, cy: e.clientY, x: item.x, y: item.y, w: item.w };
    const ratio = (item.image.height / item.image.width) * (rect.width / rect.height);
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - start.cx) / rect.width;
      const dy = (ev.clientY - start.cy) / rect.height;
      setPlaced((cur) =>
        cur.map((p) => {
          if (p.id !== item.id) return p;
          if (kind === 'resize') {
            const w = Math.min(1 - p.x, Math.max(0.03, start.w + dx));
            return { ...p, w: Math.min(w, (1 - p.y) / ratio) };
          }
          return { ...p, x: Math.min(1 - p.w, Math.max(0, start.x + dx)), y: Math.min(1 - p.w * ratio, Math.max(0, start.y + dy)) };
        }),
      );
    };
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
      job.cancel();
      setBusy(false);
      setResult(null);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };

  const save = async () => {
    if (!source) return;
    const id = job.start();
    setBusy(true);
    setFailed(false);
    try {
      const doc = await openPdf(source.bytes, source.password);
      const pages = doc.getPages();
      const embedded = new Map<Signature, Awaited<ReturnType<typeof doc.embedPng>>>();
      for (const p of placed) {
        let image = embedded.get(p.image);
        if (!image) embedded.set(p.image, (image = await doc.embedPng(p.image.png)));
        const pg = pages[p.page];
        const { width, height } = shownSize(pageBox(pg));
        const w = p.w * width;
        const h = (w * p.image.height) / p.image.width;
        await drawPicture(pg, image, p.x * width, height - p.y * height - h, w, h);
      }
      if (job.live(id)) setResult({ name: pdfName(source.file.name, '_signed'), blob: await saveBlob(doc), note: t('ui.placed', { count: placed.length }) });
    } catch {
      if (job.live(id)) setFailed(true);
    } finally {
      if (job.live(id)) setBusy(false);
    }
  };

  const here = placed.filter((p) => p.page === index);
  const today = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  return (
    <div>
      <PdfPicker
        t={t}
        lang={lang}
        source={source}
        onSource={(s) => {
          setSource(s);
          setIndex(0);
          change([]);
        }}
      />
      {source && (
        <>
          {(!sig || making) && (
            <SignaturePad
              t={t}
              onDone={(s) => {
                setSig(s);
                setMaking(false);
              }}
            />
          )}
          {sig && !making && (
            <div class="sig-current">
              <img src={sig.url} alt={t('ui.yourSig')} />
              <div class="actions">
                <button type="button" class="btn" disabled={!page} onClick={() => add(sig)}>
                  {t('ui.place')}
                </button>
                <button type="button" class="btn btn-secondary" disabled={!page} onClick={() => void dateImage(today).then(add)}>
                  {t('ui.addDate', { date: today })}
                </button>
                <button type="button" class="btn btn-secondary" onClick={() => setMaking(true)}>
                  {t('ui.newSig')}
                </button>
              </div>
            </div>
          )}
          <div class="sig-nav">
            <button type="button" class="pdf-icon" aria-label={t('ui.prev')} disabled={index === 0} onClick={() => setIndex(index - 1)}>
              <ChevronLeft />
            </button>
            <span>{t('ui.pageOf', { n: index + 1, total })}</span>
            <button type="button" class="pdf-icon" aria-label={t('ui.next')} disabled={index >= total - 1} onClick={() => setIndex(index + 1)}>
              <ChevronRight />
            </button>
          </div>
          <div class="sig-view" ref={view} style={page ? { aspectRatio: `${page.width} / ${page.height}` } : undefined}>
            {page && <img class="sig-page" src={page.url} alt={t('pdf.page', { n: index + 1 })} draggable={false} />}
            {here.map((p) => (
              <div key={p.id} class="sig-item" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: `${p.w * 100}%` }} onPointerDown={(e) => drag(e, p, 'move')}>
                <img src={p.image.url} alt="" draggable={false} />
                <button
                  type="button"
                  class="sig-remove"
                  aria-label={t('pdf.remove')}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => change(placed.filter((q) => q.id !== p.id))}
                >
                  <X />
                </button>
                <span class="sig-resize" aria-hidden="true" onPointerDown={(e) => drag(e, p, 'resize')} />
              </div>
            ))}
          </div>
          {pageFailed && (
            <p class="field-error" role="alert">
              {t('pdf.error')}
            </p>
          )}
          {placed.length > 0 && <p class="muted">{t('ui.dragHint')}</p>}
          <div class="actions">
            <button type="button" class="btn" disabled={busy || !placed.length} onClick={() => void save()}>
              {busy ? t('pdf.working') : t('ui.save', { count: placed.length })}
            </button>
          </div>
          {failed && (
            <p class="field-error" role="alert">
              {t('pdf.error')}
            </p>
          )}
          {result && <Result t={t} lang={lang} files={[result]} />}
        </>
      )}
    </div>
  );
}
