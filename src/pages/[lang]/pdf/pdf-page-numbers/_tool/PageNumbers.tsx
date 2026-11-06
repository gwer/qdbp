import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { IntField, SelectField } from '@/ui/files/fields';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { openPdf, pdfName, saveBlob } from '@/ui/pdf/pdflib';
import { StampPreview, type Stamp } from '@/ui/pdf/Preview';
import { expand, parseRanges } from '@/ui/pdf/ranges';
import { Result, type OutFile } from '@/ui/pdf/Result';
import type { PdfSource } from '@/ui/pdf/source';
import { drawLabel, pageBox, shownSize } from '@/ui/pdf/stamp';
import { anchor, numberText, type NumFormat, type Position } from './numbers';
import { useJob } from '@/ui/pdf/useJob';

const POSITIONS: Position[] = ['tl', 'tc', 'tr', 'bl', 'bc', 'br'];
const FORMATS: NumFormat[] = ['n', 'nOfTotal', 'dash', 'page', 'pageOf'];
const MM = 72 / 25.4;

export function PageNumbers({ lang, t }: ToolProps) {
  usePreload();
  const job = useJob();
  // Поля с неверным текстом: пока они есть, кнопка недоступна (иначе сработало бы прежнее значение).
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const fieldsBad = Object.values(invalid).some(Boolean);
  const [source, setSource] = useState<PdfSource | null>(null);
  const [position, setPosition] = useState<Position>('bc');
  const [format, setFormat] = useState<NumFormat>('n');
  const [first, setFirst] = useState(1);
  const [size, setSize] = useState(11);
  const [margin, setMargin] = useState(10);
  const [pages, setPages] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<OutFile | null>(null);

  const total = source?.pageCount ?? 0;
  const parsed = source && pages.trim() ? parseRanges(pages, total) : null;
  const numbered = parsed?.ok ? [...new Set(parsed.ranges.flatMap(expand))].sort((a, b) => a - b) : Array.from({ length: total }, (_, i) => i + 1);
  // Номер каждой страницы: по порядку среди нумеруемых, начиная с first.
  const numberOf = new Map(numbered.map((p, k) => [p - 1, first + k]));
  const last = first + numbered.length - 1;
  const words = (k: 'page' | 'pageOf', n: number, all: number) => t(`ui.words.${k}`, { n, total: all });

  const stamp: Stamp = async (doc, page, index) => {
    const n = numberOf.get(index);
    if (n === undefined) return;
    const { width, height } = shownSize(pageBox(page));
    const a = anchor(position, width, height, margin * MM, size);
    await drawLabel(doc, page, { text: numberText(format, n, last, words), size, color: [0, 0, 0], x: a.x, y: a.y, align: a.align, valign: 'baseline' });
  };
  const key = [position, format, first, size, margin, pages].join('|');

  const reset = () => {
    job.cancel();
    setBusy(false);
    setResult(null);
    setFailed(false);
  };

  const run = async () => {
    if (!source) return;
    reset();
    const id = job.start();
    setBusy(true);
    try {
      const doc = await openPdf(source.bytes, source.password);
      const all = doc.getPages();
      for (const p of numbered) await stamp(doc, all[p - 1], p - 1);
      if (job.live(id)) setResult({ name: pdfName(source.file.name, '_numbered'), blob: await saveBlob(doc) });
    } catch {
      if (job.live(id)) setFailed(true);
    } finally {
      if (job.live(id)) setBusy(false);
    }
  };

  const previewIndex = (numbered[0] ?? 1) - 1;
  return (
    <div>
      <PdfPicker t={t} lang={lang} source={source} onSource={(s) => (setSource(s), setPages(''), reset())} />
      {source && (
        <>
          <div class="pdf-split">
            <div>
              <div class="pos-picker" role="radiogroup" aria-label={t('ui.position')}>
                <span class="field-label">{t('ui.position')}</span>
                <div class="pos-page">
                  {POSITIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      role="radio"
                      aria-checked={position === p}
                      class={`pos-${p}`}
                      title={t(`ui.positions.${p}`)}
                      aria-label={t(`ui.positions.${p}`)}
                      onClick={() => (setPosition(p), reset())}
                    >
                      1
                    </button>
                  ))}
                </div>
              </div>
              <div class="calc-inputs">
                <SelectField
                  id="num-format"
                  label={t('ui.format')}
                  value={format}
                  options={FORMATS.map((f) => [f, numberText(f, 3, 10, words)])}
                  onChange={(v) => (setFormat(v), reset())}
                />
                <IntField id="num-first"
                onValid={(ok) => setInvalid((v) => ({ ...v, 'num-first': !ok }))} label={t('ui.first')} value={first} min={0} max={99999} onChange={(v) => (setFirst(v), reset())} />
                <IntField id="num-size"
                onValid={(ok) => setInvalid((v) => ({ ...v, 'num-size': !ok }))} label={t('ui.size')} value={size} min={4} max={96} suffix="pt" onChange={(v) => (setSize(v), reset())} />
                <IntField id="num-margin"
                onValid={(ok) => setInvalid((v) => ({ ...v, 'num-margin': !ok }))} label={t('ui.margin')} value={margin} min={0} max={100} suffix={t('ui.mm')} onChange={(v) => (setMargin(v), reset())} />
                <div class="field">
                  <label for="num-pages">{t('ui.pages')}</label>
                  <input
                    id="num-pages"
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
            </div>
            <StampPreview t={t} source={source} index={previewIndex} stamp={stamp} stampKey={key} />
          </div>
          <div class="actions">
            <button type="button" class="btn" disabled={busy || fieldsBad || parsed?.ok === false || !numbered.length} onClick={() => void run()}>
              {busy ? t('pdf.working') : t('ui.apply', { count: numbered.length })}
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
