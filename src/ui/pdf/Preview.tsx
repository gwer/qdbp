import { useEffect, useRef, useState } from 'preact/hooks';
import type { PDFDocument, PDFPage } from '@cantoo/pdf-lib';
import type { T } from '@/i18n/t';
import { docCache } from './build';
import { loadPdfLib } from './pdflib';
import { openForRender, renderPage } from './pdfjs';
import type { PdfSource } from './source';

/** Что нанести на страницу: тот же код, что и при сохранении всего файла. */
export type Stamp = (doc: PDFDocument, page: PDFPage, index: number) => Promise<void>;

/**
 * Точное превью одной страницы: она копируется в отдельный документ, на неё наносится stamp,
 * результат рисует pdf.js. Пересчитывается с паузой после изменения key.
 */
export function StampPreview({ t, source, index, stamp, stampKey }: { t: T; source: PdfSource; index: number; stamp: Stamp; stampKey: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const open = useRef(docCache());
  const stampRef = useRef(stamp);
  stampRef.current = stamp;

  useEffect(() => {
    open.current = docCache();
  }, [source]);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      try {
        const { PDFDocument } = await loadPdfLib();
        const one = await PDFDocument.create();
        const [page] = await one.copyPages(await open.current(source), [index]);
        one.addPage(page);
        await stampRef.current(one, page, index);
        const render = await openForRender(await one.save());
        try {
          const canvas = await renderPage(await render.getPage(1), { maxSide: 900 });
          const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
          if (!alive || !blob) return;
          setFailed(false);
          setUrl((old) => (old && URL.revokeObjectURL(old), URL.createObjectURL(blob)));
        } finally {
          void render.loadingTask.destroy();
        }
      } catch {
        if (alive) setFailed(true);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [source, index, stampKey]);

  useEffect(() => () => setUrl((old) => (old && URL.revokeObjectURL(old), null)), []);

  return (
    <figure class="pdf-preview">
      {url ? <img src={url} alt={t('pdf.preview')} /> : <div class="pdf-preview-empty" />}
      <figcaption class="muted">{failed ? t('pdf.error') : t('pdf.previewOf', { n: index + 1 })}</figcaption>
    </figure>
  );
}
