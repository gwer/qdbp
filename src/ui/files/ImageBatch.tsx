import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lang } from '@/i18n/config';
import type { T } from '@/i18n/t';
import { formatNumber } from '@/lib/format';
import { formatBytes, sizeChange } from './bytes';
import { downloadBlob, downloadZip, preloadZip } from './download';
import { Compare } from './Compare';
import { DropZone } from './DropZone';

export interface Processed {
  blob: Blob;
  name: string;
  width: number;
  height: number;
  srcWidth: number;
  srcHeight: number;
  /** Предупреждение у файла (например, «не удалось уложиться в лимит»). */
  warning?: string;
}

/** Ошибка с понятным пользователю текстом — показывается вместо общего files.error. */
export class FileError extends Error {}

interface Item {
  id: number;
  file: File;
  status: 'pending' | 'done' | 'error';
  error?: string;
  result?: Processed;
  url?: string;
}

let nextId = 1;

/**
 * Пакетная обработка картинок: зона загрузки, список файлов «было → стало», скачивание по одному и архивом.
 * При смене опций (optionsKey) все файлы обрабатываются заново.
 * Строки инструмента: files.* (см. DropZone) и files.download, files.downloadAll, files.clear,
 * files.processing, files.error.
 */
const PARALLEL = 2;

export function ImageBatch({
  t,
  lang,
  process,
  optionsKey,
  zipName,
  accept,
  compare,
}: {
  t: T;
  lang: Lang;
  process: (file: File) => Promise<Processed>;
  optionsKey: string;
  zipName: string;
  /** Атрибут accept поля выбора файлов (по умолчанию image/*). */
  accept?: string;
  /** Кнопка «Сравнить»: исходник и результат шторкой (для сжатия, где важны артефакты). */
  compare?: boolean;
}) {
  const [comparing, setComparing] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const processRef = useRef(process);
  processRef.current = process;
  // Номер прогона: результат устаревшего прогона (опции уже сменились) отбрасывается.
  const run = useRef(0);
  // Одна очередь на компонент и не больше PARALLEL обработок одновременно — с учётом повторных добавлений
  // и ещё не завершённых задач прошлого прогона: каждый декодированный снимок занимает ширина × высота × 4 байта,
  // и пакет 48-мегапиксельных фото разом может уронить вкладку на телефоне.
  const queue = useRef<Item[]>([]);
  const active = useRef(0);

  useEffect(preloadZip, []);

  const pump = () => {
    while (active.current < PARALLEL && queue.current.length) {
      const item = queue.current.shift()!;
      const runId = run.current;
      const ok = (result: Processed) => {
        if (run.current !== runId) return;
        const url = URL.createObjectURL(result.blob);
        setItems((cur) => cur.map((i) => (i.id === item.id ? (i.url && URL.revokeObjectURL(i.url), { ...i, status: 'done', result, url }) : i)));
      };
      const failed = (e: unknown) => {
        if (run.current !== runId) return;
        const error = e instanceof FileError ? e.message : undefined;
        setItems((cur) => cur.map((i) => (i.id === item.id ? { ...i, status: 'error', error } : i)));
      };
      active.current++;
      processRef.current(item.file)
        .then(ok, failed)
        .finally(() => {
          active.current--;
          pump();
        });
    }
  };

  const add = (files: File[]) => {
    const fresh: Item[] = files.map((file) => ({ id: nextId++, file, status: 'pending' }));
    setItems((cur) => [...cur, ...fresh]);
    queue.current.push(...fresh);
    pump();
  };

  // Смена опций — пересчитать всё (с небольшой паузой, чтобы не пересчитывать на каждое движение ползунка).
  // Берём актуальный список: файл, добавленный за эти 250 мс, тоже попадает в новый прогон.
  useEffect(() => {
    if (!items.length) return;
    const id = setTimeout(() => {
      run.current++;
      queue.current = [...itemsRef.current];
      setItems((cur) => cur.map((i) => ({ ...i, status: 'pending' })));
      pump();
    }, 250);
    return () => clearTimeout(id);
  }, [optionsKey]);

  const clear = () => {
    setComparing(null);
    run.current++;
    queue.current = [];
    items.forEach((i) => i.url && URL.revokeObjectURL(i.url));
    setItems([]);
  };

  const done = items.filter((i) => i.status === 'done' && i.result);
  return (
    <div>
      <DropZone t={t} accept={accept} onFiles={add} />
      {items.length > 0 && (
        <>
          <ul class="file-list">
            {items.map((i) => {
              const r = i.result;
              const change = r ? sizeChange(i.file.size, r.blob.size) : 0;
              return (
                <li key={i.id} class="file-row">
                  {i.url ? <img class="file-thumb" src={i.url} alt="" /> : <span class="file-thumb" />}
                  <div class="file-info">
                    <strong class="file-name">{r?.name ?? i.file.name}</strong>
                    {i.status === 'pending' && <span class="muted">{t('files.processing')}</span>}
                    {i.status === 'error' && <span class="field-error">{i.error ?? t('files.error')}</span>}
                    {i.status === 'done' && r && (
                      <span class="muted">
                        {formatBytes(lang, i.file.size)} → {formatBytes(lang, r.blob.size)}{' '}
                        <span class={change <= 0 ? 'good' : 'bad'}>
                          ({change > 0 ? '+' : ''}
                          {formatNumber(lang, Math.round(change), 'integer')}
                          {' '}%)
                        </span>
                        <br />
                        {r.srcWidth}×{r.srcHeight} → {r.width}×{r.height}
                      </span>
                    )}
                    {i.status === 'done' && r?.warning && <span class="field-error">{r.warning}</span>}
                  </div>
                  {r && i.status === 'done' && (
                    <div class="file-actions">
                      {compare && (
                        <button type="button" class="btn btn-secondary btn-small" aria-pressed={comparing === i.id} onClick={() => setComparing(comparing === i.id ? null : i.id)}>
                          {t('files.compare')}
                        </button>
                      )}
                      <button type="button" class="btn btn-secondary btn-small" onClick={() => downloadBlob(r.name, r.blob)}>
                        {t('files.download')}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {(() => {
            const c = items.find((i) => i.id === comparing && i.status === 'done' && i.url);
            return c ? <Compare key={c.id} file={c.file} after={c.url!} t={t} onClose={() => setComparing(null)} /> : null;
          })()}
          <div class="actions">
            {done.length > 1 && (
              <button type="button" class="btn btn-small" onClick={() => downloadZip(zipName, done.map((i) => ({ name: i.result!.name, blob: i.result!.blob })))}>
                {t('files.downloadAll')}
              </button>
            )}
            <button type="button" class="btn btn-secondary btn-small" onClick={clear}>
              {t('files.clear')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
