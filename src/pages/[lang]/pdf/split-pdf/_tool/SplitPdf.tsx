import { useMemo, useState } from 'preact/hooks';
import { Toggle } from '@/ui/Calculator';
import type { ToolProps } from '@/ui/define';
import { IntField } from '@/ui/files/fields';
import { assemble, docCache } from '@/ui/pdf/build';
import { PageGrid, pagesOf, type PageItem } from '@/ui/pdf/Pages';
import { PdfPicker, usePreload } from '@/ui/pdf/Picker';
import { baseName, SITE_TAIL } from '@/ui/pdf/pdflib';
import { formatPages } from '@/ui/pdf/ranges';
import { Result, type OutFile } from '@/ui/pdf/Result';
import type { PdfSource } from '@/ui/pdf/source';
import { byRanges, everyN, partName, type Group, type Mode } from './split';
import { useJob } from '@/ui/pdf/useJob';

export function SplitPdf({ lang, t }: ToolProps) {
  usePreload();
  const job = useJob();
  // Поля с неверным текстом: пока они есть, кнопка недоступна (иначе сработало бы прежнее значение).
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [source, setSource] = useState<PdfSource | null>(null);
  const [mode, setMode] = useState<Mode>('every');
  const fieldsBad = mode === 'every' && !!invalid['split-n'];
  const [n, setN] = useState(1);
  const [ranges, setRanges] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [separate, setSeparate] = useState<'one' | 'each'>('one');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<{ files: OutFile[]; zip: string } | null>(null);

  const total = source?.pageCount ?? 0;
  const plan = useMemo((): { groups: Group[] } | { error: string } => {
    if (!source) return { groups: [] };
    if (mode === 'every') return { groups: everyN(total, n) };
    if (mode === 'ranges') {
      if (!ranges.trim()) return { error: '' };
      const r = byRanges(ranges, total);
      return r.ok ? r : { error: t('ui.badRanges', { max: total }) };
    }
    const pages = [...selected].sort((a, b) => a - b);
    if (!pages.length) return { error: '' };
    return { groups: separate === 'one' ? [pages] : pages.map((p) => [p]) };
  }, [source, mode, n, ranges, selected, separate]);

  const groups = 'groups' in plan ? plan.groups : [];
  // Номер файла для каждой страницы (первый, если страница попала в несколько частей).
  const fileOf = new Map<number, number>();
  groups.forEach((g, i) => g.forEach((p) => fileOf.has(p) || fileOf.set(p, i + 1)));

  const items: PageItem[] = source
    ? pagesOf(source.doc, total).map((it) => ({
        ...it,
        selected: selected.has(it.index + 1),
        removed: mode !== 'select' && !fileOf.has(it.index + 1),
      }))
    : [];

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
      const open = docCache();
      const base = baseName(source.file.name);
      const files: OutFile[] = [];
      for (const g of groups) {
        const blob = await assemble(
          g.map((p) => ({ source, index: p - 1 })),
          open,
        );
        files.push({ name: partName(base, g, SITE_TAIL), blob, note: `${t('ui.pagesShort')} ${formatPages(g)}` });
      }
      if (job.live(id)) setResult({ files, zip: `${base}${SITE_TAIL}.zip` });
    } catch {
      if (job.live(id)) setFailed(true);
    } finally {
      if (job.live(id)) setBusy(false);
    }
  };

  return (
    <div>
      <PdfPicker
        t={t}
        lang={lang}
        source={source}
        onSource={(s) => {
          setSource(s);
          setSelected(new Set());
          reset();
        }}
      />
      {source && (
        <>
          <Toggle
            label={t('ui.mode')}
            value={mode}
            options={[
              ['every', t('ui.modes.every')],
              ['ranges', t('ui.modes.ranges')],
              ['select', t('ui.modes.select')],
            ]}
            onChange={(m) => {
              setMode(m);
              reset();
            }}
          />
          <div class="calc-inputs">
            {mode === 'every' && (
              <IntField
                id="split-n"
                onValid={(ok) => setInvalid((v) => ({ ...v, 'split-n': !ok }))}
                label={t('ui.every')}
                value={n}
                min={1}
                max={Math.max(1, total)}
                onChange={(v) => {
                  setN(v);
                  reset();
                }}
              />
            )}
            {mode === 'ranges' && (
              <div class="field field-wide">
                <label for="split-ranges">{t('ui.ranges')}</label>
                <input
                  id="split-ranges"
                  type="text"
                  autoComplete="off"
                  placeholder={total > 2 ? `1-${Math.ceil(total / 2)}, ${Math.ceil(total / 2) + 1}-${total}` : '1, 2'}
                  value={ranges}
                  aria-invalid={'error' in plan && plan.error ? 'true' : undefined}
                  onInput={(e) => {
                    setRanges(e.currentTarget.value);
                    reset();
                  }}
                />
                {'error' in plan && plan.error && <p class="field-error">{plan.error}</p>}
              </div>
            )}
          </div>
          {mode === 'select' && (
            <>
              <Toggle
                label={t('ui.output')}
                value={separate}
                options={[
                  ['one', t('ui.oneFile')],
                  ['each', t('ui.eachFile')],
                ]}
                onChange={(v) => {
                  setSeparate(v);
                  reset();
                }}
              />
              <p class="muted">
                {t('ui.selectHint')}{' '}
                <button type="button" class="link-btn" onClick={() => (setSelected(new Set(items.map((i) => i.index + 1))), reset())}>
                  {t('ui.selectAll')}
                </button>
                {selected.size > 0 && (
                  <>
                    {' · '}
                    <button type="button" class="link-btn" onClick={() => (setSelected(new Set()), reset())}>
                      {t('ui.selectNone')}
                    </button>
                  </>
                )}
              </p>
            </>
          )}
          <div class="actions">
            <button type="button" class="btn" disabled={busy || fieldsBad || !groups.length} onClick={() => void run()}>
              {busy ? t('pdf.working') : t('ui.split', { count: groups.length })}
            </button>
          </div>
          {failed && (
            <p class="field-error" role="alert">
              {t('pdf.error')}
            </p>
          )}
          {result && <Result t={t} lang={lang} files={result.files} zipName={result.zip} />}
          <PageGrid
            t={t}
            items={items}
            select={mode === 'select'}
            onChange={(next) => {
              setSelected(new Set(next.filter((i) => i.selected).map((i) => i.index + 1)));
              reset();
            }}
            badge={mode === 'select' ? undefined : (it) => fileOf.get(it.index + 1)}
          />
        </>
      )}
    </div>
  );
}
