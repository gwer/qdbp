import { useEffect, useRef, useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { formatBytes } from '@/ui/files/bytes';
import { DropZone } from '@/ui/files/DropZone';
import { assemble, type PagePart } from '@/ui/pdf/build';
import { ChevronDown, ChevronUp, X } from '@/ui/pdf/icons';
import { move, Thumb, useReorder } from '@/ui/pdf/Pages';
import { openError, PasswordForm, usePreload } from '@/ui/pdf/Picker';
import { datedName } from '@/ui/pdf/pdflib';
import { expand, parseRanges } from '@/ui/pdf/ranges';
import { Result, type OutFile } from '@/ui/pdf/Result';
import { closeSource, openSource, type OpenResult, type PdfSource } from '@/ui/pdf/source';
import { useJob } from '@/ui/pdf/useJob';

type OpenError = Exclude<OpenResult, { ok: true }>['error'];

interface Entry {
  id: number;
  file: File;
  bytes?: Uint8Array;
  source?: PdfSource;
  error?: OpenError;
  /** Какие страницы взять: пусто — все. */
  pages: string;
}

let nextId = 1;

export function MergePdf({ lang, t }: ToolProps) {
  usePreload();
  const job = useJob();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<OutFile | null>(null);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  // Документы закрываются при удалении из списка и при уходе со страницы.
  useEffect(() => () => entriesRef.current.forEach((e) => e.source && closeSource(e.source)), []);

  const change = (next: Entry[]) => {
    job.cancel();
    setBusy(false);
    setEntries(next);
    setResult(null);
    setFailed(false);
  };
  const patch = (id: number, p: Partial<Entry>) => setEntries((cur) => cur.map((e) => (e.id === id ? { ...e, ...p } : e)));

  const open = async (id: number, file: File, password?: string, bytes?: Uint8Array) => {
    const data = bytes ?? new Uint8Array(await file.arrayBuffer());
    const r = await openSource(file, password, data);
    if (!entriesRef.current.some((e) => e.id === id)) {
      if (r.ok) closeSource(r.source);
      return;
    }
    patch(id, r.ok ? { source: r.source, error: undefined, bytes: undefined } : { error: r.error, bytes: data });
  };

  const add = (files: File[]) => {
    const fresh = files.map((file) => ({ id: nextId++, file, pages: '' }));
    change([...entriesRef.current, ...fresh]);
    for (const e of fresh) void open(e.id, e.file);
  };

  const removeEntry = (id: number) => {
    const e = entries.find((x) => x.id === id);
    if (e?.source) closeSource(e.source);
    change(entries.filter((x) => x.id !== id));
  };

  const drag = useReorder(entries.length, (from, to) => change(move(entries, from, to)), 'y');

  const ranges = (e: Entry) => (e.source && e.pages.trim() ? parseRanges(e.pages, e.source.pageCount) : null);
  const ready = entries.filter((e) => e.source);
  const invalid = entries.some((e) => ranges(e)?.ok === false);
  // Пока есть неоткрытый файл (нужен пароль, повреждён), объединять нельзя: иначе он молча выпал бы из результата.
  const waiting = entries.some((e) => !e.source);
  const totalPages = ready.reduce((sum, e) => {
    const r = ranges(e);
    return sum + (r?.ok ? r.ranges.reduce((s, rg) => s + expand(rg).length, 0) : e.source!.pageCount);
  }, 0);

  const merge = async () => {
    const id = job.start();
    setBusy(true);
    setFailed(false);
    try {
      const parts: PagePart[] = [];
      for (const e of ready) {
        const r = ranges(e);
        const pages = r?.ok ? r.ranges.flatMap(expand) : Array.from({ length: e.source!.pageCount }, (_, i) => i + 1);
        for (const p of pages) parts.push({ source: e.source!, index: p - 1 });
      }
      if (job.live(id)) setResult({ name: datedName('merged'), blob: await assemble(parts), note: t('pdf.pages', { count: parts.length }) });
    } catch {
      if (job.live(id)) setFailed(true);
    } finally {
      if (job.live(id)) setBusy(false);
    }
  };

  return (
    <div>
      <DropZone t={t} kind="pdf" onFiles={add} />
      {entries.length > 0 && (
        <ol class="file-list merge-list" {...drag.list}>
          {entries.map((e, i) => {
            const r = ranges(e);
            return (
              <li
                key={e.id}
                class={`file-row merge-row ${drag.mark(i)}`}
                {...drag.item(i)}
              >
                <span class="merge-num">{i + 1}</span>
                {e.source ? (
                  <span class="merge-thumb">
                    <Thumb doc={e.source.doc} index={0} />
                  </span>
                ) : (
                  <span class="file-thumb" />
                )}
                <div class="file-info">
                  <strong class="file-name">{e.file.name}</strong>
                  {e.source && (
                    <span class="muted">
                      {t('pdf.pages', { count: e.source.pageCount })} · {formatBytes(lang, e.file.size)}
                    </span>
                  )}
                  {!e.source && !e.error && <span class="muted">{t('pdf.opening')}</span>}
                  {(e.error === 'password' || e.error === 'wrongPassword') && (
                    <PasswordForm t={t} id={`merge-pw-${e.id}`} wrong={e.error === 'wrongPassword'} onSubmit={(pw) => void open(e.id, e.file, pw, e.bytes)} />
                  )}
                  {e.error && e.error !== 'password' && e.error !== 'wrongPassword' && <span class="field-error">{openError(t, e.error)}</span>}
                  {e.source && (
                    <div class="merge-pages">
                      <label for={`merge-pages-${e.id}`}>{t('ui.pages')}</label>
                      <input
                        id={`merge-pages-${e.id}`}
                        type="text"
                        autoComplete="off"
                        placeholder={t('ui.all')}
                        value={e.pages}
                        aria-invalid={r?.ok === false ? 'true' : undefined}
                        onInput={(ev) => {
                          patch(e.id, { pages: ev.currentTarget.value });
                          job.cancel();
                          setBusy(false);
                          setResult(null);
                        }}
                      />
                    </div>
                  )}
                  {r?.ok === false && <span class="field-error">{t('ui.badPages', { max: e.source!.pageCount })}</span>}
                </div>
                <div class="merge-actions">
                  <button type="button" class="pdf-icon" title={t('pdf.moveLeft')} aria-label={`${t('pdf.moveLeft')}: ${e.file.name}`} disabled={i === 0} onClick={() => change(move(entries, i, i - 1))}>
                    <ChevronUp />
                  </button>
                  <button type="button" class="pdf-icon" title={t('pdf.remove')} aria-label={`${t('pdf.remove')}: ${e.file.name}`} onClick={() => removeEntry(e.id)}>
                    <X />
                  </button>
                  <button
                    type="button"
                    class="pdf-icon"
                    title={t('pdf.moveRight')}
                    aria-label={`${t('pdf.moveRight')}: ${e.file.name}`}
                    disabled={i === entries.length - 1}
                    onClick={() => change(move(entries, i, i + 2))}
                  >
                    <ChevronDown />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {entries.length > 0 && (
        <div class="actions">
          <button type="button" class="btn" disabled={busy || waiting || invalid || ready.length < 2} onClick={() => void merge()}>
            {busy ? t('pdf.working') : t('ui.merge', { count: totalPages })}
          </button>
          <button type="button" class="btn btn-secondary" onClick={() => (entries.forEach((e) => e.source && closeSource(e.source)), change([]))}>
            {t('files.clear')}
          </button>
        </div>
      )}
      {entries.length === 1 && ready.length === 1 && <p class="muted">{t('ui.addMore')}</p>}
      {failed && (
        <p class="field-error" role="alert">
          {t('pdf.error')}
        </p>
      )}
      {result && <Result t={t} lang={lang} files={[result]} />}
    </div>
  );
}
