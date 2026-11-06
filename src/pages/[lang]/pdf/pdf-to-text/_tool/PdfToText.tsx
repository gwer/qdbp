import { useEffect, useState } from 'preact/hooks';
import { Toggle } from '@/ui/Calculator';
import { CopyButton } from '@/ui/CopyButton';
import type { ToolProps } from '@/ui/define';
import { downloadBlob } from '@/ui/files/download';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { pdfName } from '@/ui/pdf/pdflib';
import type { PdfSource } from '@/ui/pdf/source';
import { pageText, type Piece } from './text';

export function PdfToText({ lang, t }: ToolProps) {
  usePreload(true);
  const [source, setSource] = useState<PdfSource | null>(null);
  const [pages, setPages] = useState<string[] | null>(null);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [failed, setFailed] = useState(false);
  const [marks, setMarks] = useState<'yes' | 'no'>('no');

  useEffect(() => {
    setPages(null);
    setFailed(false);
    if (!source) return;
    let alive = true;
    (async () => {
      const out: string[] = [];
      for (let n = 1; n <= source.pageCount; n++) {
        if (!alive) return;
        setProgress([n, source.pageCount]);
        const page = await source.doc.getPage(n);
        out.push(pageText((await page.getTextContent()).items.flatMap((i): Piece[] => ('str' in i ? [i] : []))));
        page.cleanup();
      }
      if (alive) setPages(out);
    })()
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setProgress(null));
    return () => {
      alive = false;
    };
  }, [source]);

  const text = pages ? (marks === 'yes' ? pages.map((p, i) => `— ${t('pdf.page', { n: i + 1 })} —\n\n${p}`) : pages).join('\n\n') : '';
  const empty = pages !== null && pages.every((p) => !p);
  return (
    <div>
      <PdfPicker t={t} lang={lang} source={source} onSource={setSource} />
      {progress && (
        <p class="muted" role="status">
          {t('ui.progress', { n: progress[0], total: progress[1] })}
        </p>
      )}
      {failed && (
        <p class="field-error" role="alert">
          {t('pdf.error')}
        </p>
      )}
      {empty && <p class="field-error">{t('ui.empty')}</p>}
      {pages && !empty && (
        <>
          <Toggle
            label={t('ui.marks')}
            value={marks}
            options={[
              ['no', t('ui.no')],
              ['yes', t('ui.yes')],
            ]}
            onChange={setMarks}
          />
          <textarea class="pdf-text" readOnly value={text} rows={16} aria-label={t('ui.text')} />
          <p class="muted">{t('ui.stats', { chars: text.length.toLocaleString(lang), pages: pages.length })}</p>
          <div class="actions">
            <CopyButton text={text} t={t} />
            <button type="button" class="btn btn-small btn-secondary" onClick={() => downloadBlob(pdfName(source!.file.name, '', 'txt'), new Blob([text], { type: 'text/plain;charset=utf-8' }))}>
              {t('ui.download')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
