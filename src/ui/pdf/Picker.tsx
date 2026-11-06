import { useEffect, useState } from 'preact/hooks';
import type { Lang } from '@/i18n/config';
import type { T } from '@/i18n/t';
import { formatBytes } from '@/ui/files/bytes';
import { DropZone } from '@/ui/files/DropZone';
import { preloadPdfLib } from './pdflib';
import { loadPdfJs } from './pdfjs';
import { closeSource, openSource, type OpenResult, type PdfSource } from './source';

/** Сообщение об ошибке открытия. */
export const openError = (t: T, error: Exclude<OpenResult, { ok: true }>['error']) =>
  t(error === 'wrongPassword' ? 'pdf.wrongPassword' : error === 'load' ? 'pdf.loadFailed' : error === 'password' ? 'pdf.needPassword' : 'pdf.broken');

/** Поле пароля для защищённого файла. */
export function PasswordForm({ t, id, wrong, onSubmit }: { t: T; id: string; wrong: boolean; onSubmit: (password: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <form
      class="pdf-password"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
    >
      <label for={id}>{t(wrong ? 'pdf.wrongPassword' : 'pdf.needPassword')}</label>
      <div class="pdf-password-row">
        <input id={id} type="password" autoComplete="off" value={value} aria-invalid={wrong ? 'true' : undefined} onInput={(e) => setValue(e.currentTarget.value)} />
        <button type="submit" class="btn">
          {t('pdf.open')}
        </button>
      </div>
    </form>
  );
}

/** Строка про открытый файл: имя, страниц, размер и кнопка «Другой файл». */
export function FileBar({ t, lang, source, onClose }: { t: T; lang: Lang; source: PdfSource; onClose: () => void }) {
  return (
    <div class="pdf-filebar">
      <div class="file-info">
        <strong class="file-name">{source.file.name}</strong>
        <span class="muted">
          {t('pdf.pages', { count: source.pageCount })} · {formatBytes(lang, source.file.size)}
        </span>
      </div>
      <button type="button" class="btn btn-secondary btn-small" onClick={onClose}>
        {t('pdf.other')}
      </button>
    </div>
  );
}

/** Подготовка библиотек заранее: pdf.js нужен сразу для миниатюр, pdf-lib — при сохранении. */
export function usePreload(pdfjs = true) {
  useEffect(() => {
    if (pdfjs) void loadPdfJs().catch(() => {});
    preloadPdfLib();
  }, []);
}

/**
 * Выбор одного PDF: зона загрузки, пароль для защищённого файла, строка с открытым файлом.
 * Документ закрывается при выборе другого файла и при размонтировании.
 */
export function PdfPicker({ t, lang, source, onSource }: { t: T; lang: Lang; source: PdfSource | null; onSource: (s: PdfSource | null) => void }) {
  const [pending, setPending] = useState<{ file: File; bytes?: Uint8Array; error?: Exclude<OpenResult, { ok: true }>['error'] } | null>(null);
  const [busy, setBusy] = useState(false);
  // Последнее открытие: ответ устаревшего (выбрали другой файл) закрывается и не применяется.
  const [seq] = useState({ n: 0 });

  useEffect(() => () => source && closeSource(source), [source]);

  const open = async (file: File, password?: string, bytes?: Uint8Array) => {
    const n = ++seq.n;
    setBusy(true);
    const data = bytes ?? new Uint8Array(await file.arrayBuffer());
    const r = await openSource(file, password, data);
    if (n !== seq.n) {
      if (r.ok) closeSource(r.source);
      return;
    }
    setBusy(false);
    if (r.ok) {
      setPending(null);
      onSource(r.source);
    } else setPending({ file, bytes: data, error: r.error });
  };

  if (source) return <FileBar t={t} lang={lang} source={source} onClose={() => onSource(null)} />;
  return (
    <div>
      <DropZone t={t} kind="pdf" multiple={false} onFiles={([f]) => void open(f)} />
      {busy && (
        <p class="muted" role="status">
          {t('pdf.opening')}
        </p>
      )}
      {pending?.error && !busy && (pending.error === 'password' || pending.error === 'wrongPassword') && (
        <>
          <p>
            <strong>{pending.file.name}</strong>
          </p>
          <PasswordForm key={pending.file.name} t={t} id="pdf-password" wrong={pending.error === 'wrongPassword'} onSubmit={(pw) => void open(pending.file, pw, pending.bytes)} />
        </>
      )}
      {pending?.error && !busy && pending.error !== 'password' && pending.error !== 'wrongPassword' && (
        <p class="field-error" role="alert">
          {pending.file.name}: {openError(t, pending.error)}
        </p>
      )}
    </div>
  );
}
