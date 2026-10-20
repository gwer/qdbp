import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lang } from '@/i18n/config';
import type { T } from '@/i18n/t';
import { formatNumber } from '@/lib/format';
import { formatBytes, sizeChange } from './bytes';
import { downloadBlob, downloadZip, preloadZip } from './download';
import { DropZone } from './DropZone';

export interface Processed {
  blob: Blob;
  name: string;
  width: number;
  height: number;
  srcWidth: number;
  srcHeight: number;
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
export function ImageBatch({
  t,
  lang,
  process,
  optionsKey,
  zipName,
  accept,
}: {
  t: T;
  lang: Lang;
  process: (file: File) => Promise<Processed>;
  optionsKey: string;
  zipName: string;
  /** Атрибут accept поля выбора файлов (по умолчанию image/*). */
  accept?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const processRef = useRef(process);
  processRef.current = process;
  // Номер прогона: результат устаревшего прогона (опции уже сменились) отбрасывается.
  const run = useRef(0);

  useEffect(preloadZip, []);

  const work = (list: Item[], runId: number) => {
    for (const item of list) {
      processRef.current(item.file).then(
        (result) => {
          if (run.current !== runId) return;
          const url = URL.createObjectURL(result.blob);
          setItems((cur) => cur.map((i) => (i.id === item.id ? (i.url && URL.revokeObjectURL(i.url), { ...i, status: 'done', result, url }) : i)));
        },
        (e) => {
          if (run.current !== runId) return;
          const error = e instanceof FileError ? e.message : undefined;
          setItems((cur) => cur.map((i) => (i.id === item.id ? { ...i, status: 'error', error } : i)));
        },
      );
    }
  };

  const add = (files: File[]) => {
    const fresh: Item[] = files.map((file) => ({ id: nextId++, file, status: 'pending' }));
    setItems((cur) => [...cur, ...fresh]);
    work(fresh, run.current);
  };

  // Смена опций — пересчитать всё (с небольшой паузой, чтобы не пересчитывать на каждое движение ползунка).
  useEffect(() => {
    if (!items.length) return;
    const id = setTimeout(() => {
      const runId = ++run.current;
      setItems((cur) => cur.map((i) => ({ ...i, status: 'pending' })));
      work(items, runId);
    }, 250);
    return () => clearTimeout(id);
  }, [optionsKey]);

  const clear = () => {
    run.current++;
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
                  </div>
                  {r && (
                    <button type="button" class="btn btn-secondary btn-small" onClick={() => downloadBlob(r.name, r.blob)}>
                      {t('files.download')}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
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
