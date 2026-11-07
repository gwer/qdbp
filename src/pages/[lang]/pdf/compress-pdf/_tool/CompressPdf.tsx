import { useState } from 'preact/hooks';
import { Toggle } from '@/ui/Calculator';
import type { ToolProps } from '@/ui/define';
import { formatNumber } from '@/lib/format';
import { formatBytes, sizeChange } from '@/ui/files/bytes';
import { SelectField } from '@/ui/files/fields';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { loadPdfLib, openPdf, pdfName } from '@/ui/pdf/pdflib';
import { renderPage } from '@/ui/pdf/pdfjs';
import { Result, type OutFile } from '@/ui/pdf/Result';
import type { PdfSource } from '@/ui/pdf/source';
import { deflatePlain, dropUnreachable, maxPageInches, recompressImages } from './compress';
import { useJob } from '@/ui/pdf/useJob';

type Mode = 'images' | 'scan';
type Level = 'low' | 'medium' | 'high';

/** Разрешение картинок и качество JPEG для уровней сжатия. */
const LEVELS: Record<Level, { dpi: number; quality: number }> = {
  low: { dpi: 200, quality: 0.85 },
  medium: { dpi: 150, quality: 0.75 },
  high: { dpi: 100, quality: 0.6 },
};

/** Каждая страница — картинка JPEG; текст перестаёт быть текстом. */
async function rasterize(source: PdfSource, level: Level, onProgress: (n: number, total: number) => void): Promise<Uint8Array> {
  const { PDFDocument } = await loadPdfLib();
  const out = await PDFDocument.create();
  const { dpi, quality } = LEVELS[level];
  for (let n = 1; n <= source.pageCount; n++) {
    onProgress(n, source.pageCount);
    const page = await source.doc.getPage(n);
    const view = page.getViewport({ scale: 1 });
    const canvas = await renderPage(page, { scale: Math.min(dpi / 72, Math.sqrt(16_000_000 / (view.width * view.height))) });
    page.cleanup();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
    canvas.width = canvas.height = 0;
    if (!blob) throw new Error('encode');
    const image = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    out.addPage([view.width, view.height]).drawImage(image, { x: 0, y: 0, width: view.width, height: view.height });
  }
  return out.save();
}

export function CompressPdf({ lang, t }: ToolProps) {
  usePreload();
  const job = useJob();
  const [source, setSource] = useState<PdfSource | null>(null);
  const [mode, setMode] = useState<Mode>('images');
  const [level, setLevel] = useState<Level>('medium');
  const [progress, setProgress] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<{ file: OutFile; note: string; smaller: boolean } | null>(null);

  const reset = () => {
    job.cancel();
    setProgress(null);
    setResult(null);
    setFailed(false);
  };

  const run = async () => {
    if (!source) return;
    reset();
    const id = job.start();
    // Прогресс и итог отменённого запуска не показываются.
    const show = (p: string | null) => job.live(id) && setProgress(p);
    show(t('pdf.working'));
    try {
      let bytes: Uint8Array;
      let note = '';
      if (mode === 'scan') {
        bytes = await rasterize(source, level, (n, total) => show(t('ui.progressPage', { n, total })));
      } else {
        const lib = await loadPdfLib();
        const doc = await openPdf(source.bytes, source.password);
        const { dpi, quality } = LEVELS[level];
        const images = await recompressImages(lib, doc, { maxSide: Math.ceil(maxPageInches(doc) * dpi), quality }, (n, total) =>
          show(t('ui.progressImage', { n: Math.min(n + 1, total), total })),
        );
        show(t('pdf.working'));
        dropUnreachable(lib, doc);
        deflatePlain(lib, doc);
        bytes = await doc.save({ useObjectStreams: true });
        note = images.total ? t('ui.images', { changed: images.changed, total: images.total }) : t('ui.noImages');
      }
      const before = source.file.size;
      const smaller = bytes.length < before;
      // Сжатие изображений: не стало меньше — отдаём исходный файл, а не увеличенный. «Как скан» отдаётся всегда:
      // страницы картинками нужны и ради того, чтобы текст, подпись или водяной знак нельзя было отделить от страницы.
      const blob = smaller || mode === 'scan' ? new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }) : source.file;
      if (job.live(id)) setResult({ file: { name: pdfName(source.file.name, '_compressed'), blob }, note, smaller });
    } catch {
      if (job.live(id)) setFailed(true);
    } finally {
      show(null);
    }
  };

  const change = result && source ? sizeChange(source.file.size, result.file.blob.size) : 0;
  return (
    <div>
      <PdfPicker
        t={t}
        lang={lang}
        source={source}
        onSource={(s) => {
          setSource(s);
          reset();
        }}
      />
      {source && (
        <>
          <Toggle
            label={t('ui.mode')}
            value={mode}
            options={[
              ['images', t('ui.modes.images')],
              ['scan', t('ui.modes.scan')],
            ]}
            onChange={(m) => (setMode(m), reset())}
          />
          <p class="muted">{t(mode === 'images' ? 'ui.imagesHint' : 'ui.scanHint')}</p>
          <div class="calc-inputs">
            <SelectField
              id="cmp-level"
              label={t('ui.level.label')}
              value={level}
              options={(['low', 'medium', 'high'] as Level[]).map((l) => [l, t(`ui.level.${l}`, { dpi: LEVELS[l].dpi })])}
              onChange={(v) => (setLevel(v), reset())}
            />
          </div>
          <div class="actions">
            <button type="button" class="btn" disabled={!!progress} onClick={() => void run()}>
              {progress ?? t('ui.compress')}
            </button>
          </div>
          {failed && (
            <p class="field-error" role="alert">
              {t('pdf.error')}
            </p>
          )}
          {result && source && (
            <Result t={t} lang={lang} files={[result.file]}>
              <p>
                {formatBytes(lang, source.file.size)} → {formatBytes(lang, result.file.blob.size)}{' '}
                {result.smaller && <span class="good">({formatNumber(lang, Math.round(change), 'integer')} %)</span>}
              </p>
              {!result.smaller && <p class="field-error">{t(mode === 'images' ? 'ui.notSmaller' : 'ui.notSmallerScan')}</p>}
              {result.note && <p class="muted">{result.note}</p>}
            </Result>
          )}
        </>
      )}
    </div>
  );
}
