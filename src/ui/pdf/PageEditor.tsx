import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { editPages } from './build';
import { RotateCcw, RotateCw } from './icons';
import { PageGrid, pagesOf, type PageItem } from './Pages';
import { PdfPicker, usePreload } from './Picker';
import { pdfName } from './pdflib';
import { Result, type OutFile } from './Result';
import type { PdfSource } from './source';
import { useJob } from './useJob';

/**
 * Правка страниц одного PDF на месте: поворот, а для «Упорядочить» — ещё перестановка и удаление.
 * Строки инструмента: ui.hint, ui.save (с {count}), ui.reset, ui.allLeft, ui.allRight, ui.noPages.
 */
export function PageEditor({ lang, t, organize, suffix }: ToolProps & { organize: boolean; suffix: string }) {
  usePreload();
  const job = useJob();
  const [source, setSource] = useState<PdfSource | null>(null);
  const [items, setItems] = useState<PageItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<OutFile | null>(null);

  const change = (next: PageItem[]) => {
    job.cancel();
    setBusy(false);
    setItems(next);
    setResult(null);
    setFailed(false);
  };
  const kept = items.filter((i) => !i.removed).length;
  const changed = items.some((it, k) => it.rotate || it.removed || it.index !== k);

  const save = async () => {
    if (!source) return;
    const id = job.start();
    setBusy(true);
    setFailed(false);
    try {
      const blob = await editPages(source, items);
      if (job.live(id)) setResult({ name: pdfName(source.file.name, suffix), blob, note: t('pdf.pages', { count: kept }) });
    } catch {
      if (job.live(id)) setFailed(true);
    } finally {
      if (job.live(id)) setBusy(false);
    }
  };

  const rotateAll = (by: number) => change(items.map((it) => ({ ...it, rotate: (it.rotate + by + 360) % 360 })));

  return (
    <div>
      <PdfPicker
        t={t}
        lang={lang}
        source={source}
        onSource={(s) => {
          setSource(s);
          change(s ? pagesOf(s.doc, s.pageCount) : []);
        }}
      />
      {source && (
        <>
          <p class="muted">{t('ui.hint')}</p>
          <div class="actions">
            <button type="button" class="btn" disabled={busy || !kept || !changed} onClick={() => void save()}>
              {busy ? t('pdf.working') : t('ui.save', { count: kept })}
            </button>
            <button type="button" class="btn btn-secondary btn-with-icon" onClick={() => rotateAll(-90)}>
              <RotateCcw /> {t('ui.allLeft')}
            </button>
            <button type="button" class="btn btn-secondary btn-with-icon" onClick={() => rotateAll(90)}>
              <RotateCw /> {t('ui.allRight')}
            </button>
            {changed && (
              <button type="button" class="btn btn-secondary" onClick={() => change(pagesOf(source.doc, source.pageCount))}>
                {t('ui.reset')}
              </button>
            )}
          </div>
          {!kept && <p class="field-error">{t('ui.noPages')}</p>}
          {failed && (
            <p class="field-error" role="alert">
              {t('pdf.error')}
            </p>
          )}
          {result && <Result t={t} lang={lang} files={[result]} />}
          <PageGrid t={t} items={items} onChange={change} reorder={organize} remove={organize} rotate />
        </>
      )}
    </div>
  );
}
