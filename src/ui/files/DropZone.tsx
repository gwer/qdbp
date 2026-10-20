import { useEffect, useRef, useState } from 'preact/hooks';
import type { T } from '@/i18n/t';
import { isImage } from './image';

/** Ограничение на файл: больше — браузеру может не хватить памяти на декодирование. */
export const MAX_BYTES = 50_000_000;

export interface Rejected {
  name: string;
  reason: 'notImage' | 'tooLarge';
}

/**
 * Зона загрузки: клик (выбор файлов), перетаскивание и вставка из буфера обмена (Ctrl+V).
 * Строки инструмента: files.drop, files.choose, files.paste, files.notImage, files.tooLarge, files.privacy.
 */
export function DropZone({
  t,
  multiple = true,
  accept = 'image/*',
  onFiles,
}: {
  t: T;
  multiple?: boolean;
  accept?: string;
  onFiles: (files: File[]) => void;
}) {
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const input = useRef<HTMLInputElement>(null);

  const take = (list: FileList | File[] | null | undefined) => {
    const all = [...(list ?? [])].slice(0, multiple ? undefined : 1);
    const ok: File[] = [];
    const bad: Rejected[] = [];
    for (const f of all) {
      if (!isImage(f)) bad.push({ name: f.name, reason: 'notImage' });
      else if (f.size > MAX_BYTES) bad.push({ name: f.name, reason: 'tooLarge' });
      else ok.push(f);
    }
    setRejected(bad);
    if (ok.length) onFiles(ok);
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.length) {
        e.preventDefault();
        take(files);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  return (
    <div>
      <label
        class={over ? 'dropzone dropzone-over' : 'dropzone'}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer?.files);
        }}
      >
        <input
          ref={input}
          type="file"
          accept={accept}
          multiple={multiple}
          class="visually-hidden"
          onChange={(e) => {
            take(e.currentTarget.files);
            e.currentTarget.value = '';
          }}
        />
        <span class="dropzone-title">
          {t('files.drop')} <u>{t('files.choose')}</u>
        </span>
        <span class="dropzone-hint">{t('files.paste')}</span>
      </label>
      {rejected.map((r) => (
        <p class="field-error" key={r.name}>
          {r.name}: {t(r.reason === 'notImage' ? 'files.notImage' : 'files.tooLarge', { max: '50 MB' })}
        </p>
      ))}
      <p class="muted dropzone-privacy">{t('files.privacy')}</p>
    </div>
  );
}
