import { useEffect, useRef, useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { DropZone } from '@/ui/files/DropZone';
import { SelectField } from '@/ui/files/fields';
import { decode } from '@/ui/files/image';
import { isJpeg, readMeta } from '@/ui/files/jpeg';
import { ChevronLeft, ChevronRight, RotateCcw, RotateCw, X } from '@/ui/pdf/icons';
import { move, useReorder } from '@/ui/pdf/Pages';
import { datedName, loadPdfLib, pdfName, preloadPdfLib, saveBlob } from '@/ui/pdf/pdflib';
import { Result, type OutFile } from '@/ui/pdf/Result';
import { exifRotation, place, type Margin, type Orientation, type PageSize } from './layout';
import { useJob } from '@/ui/pdf/useJob';

interface Item {
  id: number;
  file: File;
  url: string;
  /** Поворот пользователя по часовой, поверх EXIF. */
  rotate: number;
}

let nextId = 1;

const isPng = (b: Uint8Array) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;

/** Картинка в формате, который PDF понимает напрямую: JPEG и PNG — как есть, остальное — через canvas в JPEG. */
async function prepare(file: File): Promise<{ kind: 'jpg' | 'png'; bytes: Uint8Array; rotate: number }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (isJpeg(bytes)) {
    const rotate = exifRotation(readMeta(bytes).orientation);
    if (rotate !== null) return { kind: 'jpg', bytes, rotate };
  } else if (isPng(bytes)) return { kind: 'png', bytes, rotate: 0 };
  return { kind: 'jpg', bytes: await reencode(file), rotate: 0 };
}

/** WebP, GIF, отражённые по EXIF JPEG и прочее — в JPEG 92 % (ориентация применяется при декодировании). */
async function reencode(file: Blob): Promise<Uint8Array> {
  const bitmap = await decode(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.92));
    if (!blob) throw new Error('encode');
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    bitmap.close();
  }
}

export function JpgToPdf({ lang, t }: ToolProps) {
  const job = useJob();
  const [items, setItems] = useState<Item[]>([]);
  const [size, setSize] = useState<PageSize>(lang === 'en' ? 'letter' : 'a4');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [margin, setMargin] = useState<Margin>('none');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OutFile | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    preloadPdfLib();
    return () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url));
  }, []);

  const change = (next: Item[]) => {
    job.cancel();
    setBusy(false);
    setItems(next);
    setResult(null);
    setError(null);
  };
  const add = (files: File[]) => change([...items, ...files.map((file) => ({ id: nextId++, file, url: URL.createObjectURL(file), rotate: 0 }))]);
  const drag = useReorder(items.length, (from, to) => change(move(items, from, to)), 'x');
  const turn = (i: number, by: number) => change(items.map((it, j) => (j === i ? { ...it, rotate: (it.rotate + by + 360) % 360 } : it)));
  const remove = (i: number) => {
    URL.revokeObjectURL(items[i].url);
    change(items.filter((_, j) => j !== i));
  };

  const build = async () => {
    const id = job.start();
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const doc = await PDFDocument.create();
      for (const it of items) {
        let image;
        let rotate: number;
        try {
          const p = await prepare(it.file);
          rotate = p.rotate;
          image = p.kind === 'png' ? await doc.embedPng(p.bytes) : await doc.embedJpg(p.bytes).catch(async () => doc.embedJpg(await reencode(it.file)));
        } catch {
          setError(t('ui.badImage', { name: it.file.name }));
          return;
        }
        const pl = place(image.width, image.height, rotate + it.rotate, { size, orientation, margin });
        const page = doc.addPage([pl.pageW, pl.pageH]);
        page.drawImage(image, { x: pl.x, y: pl.y, width: pl.width, height: pl.height });
        if (pl.rotate) page.setRotation(degrees(pl.rotate));
      }
      if (job.live(id)) setResult({ name: items.length === 1 ? pdfName(items[0].file.name) : datedName('images'), blob: await saveBlob(doc), note: t('pdf.pages', { count: items.length }) });
    } catch {
      setError(t('pdf.error'));
    } finally {
      if (job.live(id)) setBusy(false);
    }
  };

  const opt = <V extends string>(key: string, values: V[]): [V, string][] => values.map((v) => [v, t(`ui.${key}.${v}`)]);

  return (
    <div>
      <div class="calc-inputs">
        <SelectField id="img-size" label={t('ui.size.label')} value={size} options={opt('size', ['a4', 'letter', 'fit'] as PageSize[])} onChange={(v) => (setSize(v), change(items))} />
        {size !== 'fit' && (
          <SelectField
            id="img-orientation"
            label={t('ui.orientation.label')}
            value={orientation}
            options={opt('orientation', ['auto', 'portrait', 'landscape'] as Orientation[])}
            onChange={(v) => (setOrientation(v), change(items))}
          />
        )}
        <SelectField id="img-margin" label={t('ui.margin.label')} value={margin} options={opt('margin', ['none', 'small', 'large'] as Margin[])} onChange={(v) => (setMargin(v), change(items))} />
      </div>
      <DropZone t={t} onFiles={add} />
      {items.length > 0 && (
        <>
          <ol class="pdf-grid" {...drag.list}>
            {items.map((it, i) => (
              <li
                key={it.id}
                class={`pdf-card ${drag.mark(i)}`}
                {...drag.item(i)}
              >
                <div class="pdf-thumb">
                  <img src={it.url} alt="" draggable={false} style={it.rotate ? { transform: `rotate(${it.rotate}deg)` } : undefined} />
                </div>
                <span class="pdf-badge">{i + 1}</span>
                <span class="pdf-label pdf-label-name" title={it.file.name}>
                  {it.file.name}
                </span>
                <span class="pdf-tools">
                  <button type="button" class="pdf-icon" title={t('pdf.moveLeft')} aria-label={`${t('pdf.moveLeft')}: ${it.file.name}`} disabled={i === 0} onClick={() => change(move(items, i, i - 1))}>
                    <ChevronLeft />
                  </button>
                  <button type="button" class="pdf-icon" title={t('pdf.rotateLeft')} aria-label={`${t('pdf.rotateLeft')}: ${it.file.name}`} onClick={() => turn(i, -90)}>
                    <RotateCcw />
                  </button>
                  <button type="button" class="pdf-icon" title={t('pdf.rotateRight')} aria-label={`${t('pdf.rotateRight')}: ${it.file.name}`} onClick={() => turn(i, 90)}>
                    <RotateCw />
                  </button>
                  <button type="button" class="pdf-icon" title={t('pdf.remove')} aria-label={`${t('pdf.remove')}: ${it.file.name}`} onClick={() => remove(i)}>
                    <X />
                  </button>
                  <button
                    type="button"
                    class="pdf-icon"
                    title={t('pdf.moveRight')}
                    aria-label={`${t('pdf.moveRight')}: ${it.file.name}`}
                    disabled={i === items.length - 1}
                    onClick={() => change(move(items, i, i + 2))}
                  >
                    <ChevronRight />
                  </button>
                </span>
              </li>
            ))}
          </ol>
          <div class="actions">
            <button type="button" class="btn" disabled={busy} onClick={() => void build()}>
              {busy ? t('pdf.working') : t('ui.create', { count: items.length })}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              onClick={() => {
                items.forEach((i) => URL.revokeObjectURL(i.url));
                change([]);
              }}
            >
              {t('files.clear')}
            </button>
          </div>
        </>
      )}
      {error && (
        <p class="field-error" role="alert">
          {error}
        </p>
      )}
      {result && <Result t={t} lang={lang} files={[result]} />}
    </div>
  );
}
