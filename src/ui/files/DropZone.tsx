import { useEffect, useRef, useState } from 'preact/hooks';
import type { T } from '@/i18n/t';
import { isImage } from './image';

/** Ограничение на файл: больше — браузеру может не хватить памяти на декодирование. */
export const MAX_BYTES = 50_000_000;

/**
 * Что принимает зона: картинки (строки files.*) или PDF (строки pdf.drop, pdf.notPdf).
 * PDF целиком читается в память, но не декодируется в пиксели, поэтому лимит больше.
 */
const KINDS = {
  image: { accept: 'image/*', check: isImage, max: MAX_BYTES, drop: 'files.drop', wrong: 'files.notImage', paste: true },
  pdf: { accept: 'application/pdf,.pdf', check: (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name), max: 300_000_000, drop: 'pdf.drop', wrong: 'pdf.notPdf', paste: false },
};

export interface Rejected {
  name: string;
  reason: 'notImage' | 'tooLarge';
}

/**
 * Зона загрузки: клик (выбор файлов), перетаскивание и вставка из буфера обмена (Ctrl+V).
 * Строки: files.drop, files.choose, files.paste, files.notImage, files.tooLarge, files.privacy (для PDF — pdf.drop, pdf.notPdf).
 */
export function DropZone({
  t,
  multiple = true,
  kind = 'image',
  accept,
  onFiles,
}: {
  t: T;
  multiple?: boolean;
  kind?: keyof typeof KINDS;
  accept?: string;
  onFiles: (files: File[]) => void;
}) {
  const k = KINDS[kind];
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const input = useRef<HTMLInputElement>(null);

  const take = (list: FileList | File[] | null | undefined) => {
    const all = [...(list ?? [])].slice(0, multiple ? undefined : 1);
    const ok: File[] = [];
    const bad: Rejected[] = [];
    for (const f of all) {
      if (!k.check(f)) bad.push({ name: f.name, reason: 'notImage' });
      else if (f.size > k.max) bad.push({ name: f.name, reason: 'tooLarge' });
      else ok.push(f);
    }
    setRejected(bad);
    if (ok.length) onFiles(ok);
  };

  // Обработчик вставки вешается один раз, а take меняется с каждым рендером (в нём актуальный onFiles):
  // без ref вставка видела бы список файлов первого рендера и затирала добавленные позже.
  const takeRef = useRef(take);
  takeRef.current = take;
  useEffect(() => {
    if (!k.paste) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.length) {
        e.preventDefault();
        takeRef.current(files);
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
          accept={accept ?? k.accept}
          multiple={multiple}
          class="visually-hidden"
          onChange={(e) => {
            take(e.currentTarget.files);
            e.currentTarget.value = '';
          }}
        />
        <span class="dropzone-title">
          {t(k.drop)} <u>{t('files.choose')}</u>
        </span>
        {k.paste && <span class="dropzone-hint">{t('files.paste')}</span>}
      </label>
      {rejected.map((r) => (
        <p class="field-error" key={r.name}>
          {r.name}: {t(r.reason === 'notImage' ? k.wrong : 'files.tooLarge', { max: `${k.max / 1e6} MB` })}
        </p>
      ))}
      <p class="muted dropzone-privacy">{t('files.privacy')}</p>
    </div>
  );
}
