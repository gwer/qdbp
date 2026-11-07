import { useRef, useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { QualityField, SelectField } from '@/ui/files/fields';
import { PageGrid, pagesOf } from '@/ui/pdf/Pages';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { baseName, SITE_TAIL } from '@/ui/pdf/pdflib';
import { renderPage } from '@/ui/pdf/pdfjs';
import { expand, parseRanges } from '@/ui/pdf/ranges';
import { Result, type OutFile } from '@/ui/pdf/Result';
import type { PdfSource } from '@/ui/pdf/source';
import { fitScale } from './scale';

type Format = 'jpg' | 'png';
const DPIS = ['72', '150', '300'] as const;
type Dpi = (typeof DPIS)[number];

export function PdfToJpg({ lang, t }: ToolProps) {
  usePreload(true);
  const [source, setSource] = useState<PdfSource | null>(null);
  const [format, setFormat] = useState<Format>('jpg');
  const [dpi, setDpi] = useState<Dpi>('150');
  const [quality, setQuality] = useState(90);
  const [pages, setPages] = useState('');
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<{ files: OutFile[]; zip: string } | null>(null);
  // Номер запуска: смена файла или настроек отменяет текущую конвертацию.
  const run = useRef(0);

  const total = source?.pageCount ?? 0;
  const parsed = source && pages.trim() ? parseRanges(pages, total) : null;
  const list = parsed?.ok ? parsed.ranges.flatMap(expand) : Array.from({ length: total }, (_, i) => i + 1);

  const reset = () => {
    run.current++;
    setProgress(null);
    setResult(null);
    setFailed(false);
  };

  const convert = async () => {
    if (!source) return;
    const id = ++run.current;
    setResult(null);
    setFailed(false);
    const base = baseName(source.file.name);
    const digits = String(total).length;
    const files: OutFile[] = [];
    try {
      for (let k = 0; k < list.length; k++) {
        setProgress([k + 1, list.length]);
        const n = list[k];
        const page = await source.doc.getPage(n);
        const base1 = page.getViewport({ scale: 1 });
        const { scale, reduced } = fitScale(base1.width, base1.height, Number(dpi) / 72);
        const canvas = await renderPage(page, { scale });
        page.cleanup();
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, format === 'png' ? 'image/png' : 'image/jpeg', quality / 100));
        canvas.width = canvas.height = 0;
        if (run.current !== id) return;
        if (!blob) throw new Error('encode');
        const note = `${t('pdf.page', { n })} · ${Math.round(base1.width * scale)}×${Math.round(base1.height * scale)}${reduced ? ` · ${t('ui.reduced', { dpi: Math.floor(scale * 72) })}` : ''}`;
        files.push({ name: `${base}-${String(n).padStart(digits, '0')}${SITE_TAIL}.${format}`, blob, note });
      }
      setResult({ files, zip: `${base}-${format}${SITE_TAIL}.zip` });
    } catch {
      if (run.current === id) setFailed(true);
    } finally {
      if (run.current === id) setProgress(null);
    }
  };

  const formatOpts: [Format, string][] = [
    ['jpg', 'JPG'],
    ['png', 'PNG'],
  ];
  return (
    <div>
      <PdfPicker
        t={t}
        lang={lang}
        source={source}
        onSource={(s) => {
          setSource(s);
          setPages('');
          reset();
        }}
      />
      {source && (
        <>
          <div class="calc-inputs">
            <SelectField id="p2j-format" label={t('ui.format')} value={format} options={formatOpts} onChange={(v) => (setFormat(v), reset())} />
            <SelectField id="p2j-dpi" label={t('ui.dpi.label')} value={dpi} options={DPIS.map((d) => [d, t(`ui.dpi.d${d}`)])} onChange={(v) => (setDpi(v), reset())} />
            {format === 'jpg' && <QualityField id="p2j-quality" label={t('ui.quality')} value={quality} onChange={(v) => (setQuality(v), reset())} />}
            <div class="field">
              <label for="p2j-pages">{t('ui.pages')}</label>
              <input
                id="p2j-pages"
                type="text"
                autoComplete="off"
                placeholder={t('ui.all')}
                value={pages}
                aria-invalid={parsed?.ok === false ? 'true' : undefined}
                onInput={(e) => (setPages(e.currentTarget.value), reset())}
              />
              {parsed?.ok === false && <p class="field-error">{t('ui.badPages', { max: total })}</p>}
            </div>
          </div>
          <div class="actions">
            <button type="button" class="btn" disabled={!!progress || parsed?.ok === false || !list.length} onClick={() => void convert()}>
              {progress ? t('ui.progress', { n: progress[0], total: progress[1] }) : t('ui.convert', { count: list.length })}
            </button>
          </div>
          {failed && (
            <p class="field-error" role="alert">
              {t('pdf.error')}
            </p>
          )}
          {result && <Result t={t} lang={lang} files={result.files} zipName={result.zip} />}
          <PageGrid t={t} items={pagesOf(source.doc, total).map((it) => ({ ...it, removed: !list.includes(it.index + 1) }))} onChange={() => {}} />
        </>
      )}
    </div>
  );
}
