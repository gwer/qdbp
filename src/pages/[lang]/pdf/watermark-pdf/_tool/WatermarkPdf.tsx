import { useState } from 'preact/hooks';
import { Toggle } from '@/ui/Calculator';
import type { ToolProps } from '@/ui/define';
import { IntField, QualityField } from '@/ui/files/fields';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { openPdf, pdfName, saveBlob } from '@/ui/pdf/pdflib';
import { StampPreview, type Stamp } from '@/ui/pdf/Preview';
import { expand, parseRanges } from '@/ui/pdf/ranges';
import { Result, type OutFile } from '@/ui/pdf/Result';
import type { PdfSource } from '@/ui/pdf/source';
import { drawLabel, labelWidth, pageBox, shownSize } from '@/ui/pdf/stamp';
import { tiles } from './tiles';

type Layout = 'center' | 'tile';
type Angle = '45' | '0';

const hexToRgb = (hex: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];

export function WatermarkPdf({ lang, t }: ToolProps) {
  usePreload();
  const [source, setSource] = useState<PdfSource | null>(null);
  const [text, setText] = useState(t('ui.default'));
  const [size, setSize] = useState(60);
  const [color, setColor] = useState('#c62828');
  const [opacity, setOpacity] = useState(30);
  const [angle, setAngle] = useState<Angle>('45');
  const [layout, setLayout] = useState<Layout>('center');
  const [pages, setPages] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<OutFile | null>(null);

  const total = source?.pageCount ?? 0;
  const parsed = source && pages.trim() ? parseRanges(pages, total) : null;
  const list = parsed?.ok ? [...new Set(parsed.ranges.flatMap(expand))].sort((a, b) => a - b) : Array.from({ length: total }, (_, i) => i + 1);
  const value = text.trim();

  const stamp: Stamp = async (doc, page) => {
    if (!value) return;
    const { width, height } = shownSize(pageBox(page));
    const base = { text: value, size, color: hexToRgb(color), opacity: opacity / 100, angle: Number(angle), align: 'center', valign: 'middle' } as const;
    const points = layout === 'center' ? [[width / 2, height / 2]] : tiles(width, height, await labelWidth(doc, base), size, Number(angle));
    for (const [x, y] of points) await drawLabel(doc, page, { ...base, x, y });
  };
  const key = [value, size, color, opacity, angle, layout].join('|');

  const reset = () => {
    setResult(null);
    setFailed(false);
  };

  const run = async () => {
    if (!source) return;
    setBusy(true);
    reset();
    try {
      const doc = await openPdf(source.bytes, source.password);
      const all = doc.getPages();
      for (const p of list) await stamp(doc, all[p - 1], p - 1);
      setResult({ name: pdfName(source.file.name, '_watermark'), blob: await saveBlob(doc) });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfPicker t={t} lang={lang} source={source} onSource={(s) => (setSource(s), setPages(''), reset())} />
      {source && (
        <>
          <div class="pdf-split">
            <div>
              <div class="calc-inputs">
                <div class="field field-wide">
                  <label for="wm-text">{t('ui.text')}</label>
                  <input id="wm-text" type="text" autoComplete="off" value={text} maxLength={200} onInput={(e) => (setText(e.currentTarget.value), reset())} />
                </div>
                <IntField id="wm-size" label={t('ui.size')} value={size} min={6} max={300} suffix="pt" onChange={(v) => (setSize(v), reset())} />
                <div class="field">
                  <label for="wm-color">{t('ui.color')}</label>
                  <input id="wm-color" type="color" value={color} onInput={(e) => (setColor(e.currentTarget.value), reset())} />
                </div>
                <QualityField id="wm-opacity" label={t('ui.opacity')} value={opacity} onChange={(v) => (setOpacity(v), reset())} />
                <div class="field">
                  <label for="wm-pages">{t('ui.pages')}</label>
                  <input
                    id="wm-pages"
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
              <Toggle
                label={t('ui.angle')}
                value={angle}
                options={[
                  ['45', t('ui.diagonal')],
                  ['0', t('ui.horizontal')],
                ]}
                onChange={(v) => (setAngle(v), reset())}
              />
              <Toggle
                label={t('ui.layout')}
                value={layout}
                options={[
                  ['center', t('ui.center')],
                  ['tile', t('ui.tile')],
                ]}
                onChange={(v) => (setLayout(v), reset())}
              />
            </div>
            <StampPreview t={t} source={source} index={(list[0] ?? 1) - 1} stamp={stamp} stampKey={key} />
          </div>
          <div class="actions">
            <button type="button" class="btn" disabled={busy || !value || parsed?.ok === false || !list.length} onClick={() => void run()}>
              {busy ? t('pdf.working') : t('ui.apply', { count: list.length })}
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
