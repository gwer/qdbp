import { useEffect } from 'preact/hooks';
import type { Lang } from '@/i18n/config';
import type { T } from '@/i18n/t';
import { formatBytes } from '@/ui/files/bytes';
import { downloadBlob, downloadZip, preloadZip } from '@/ui/files/download';

export interface OutFile {
  name: string;
  blob: Blob;
  /** Пояснение под именем (например, «стр. 1–3»). */
  note?: string;
}

/**
 * Готовые файлы: по одному «Скачать» у каждого и архив, если файлов несколько.
 * Строки: pdf.ready, files.download, files.downloadAll.
 */
export function Result({ t, lang, files, zipName, children }: { t: T; lang: Lang; files: OutFile[]; zipName?: string; children?: preact.ComponentChildren }) {
  useEffect(preloadZip, []);
  return (
    <div class="pdf-result" role="status">
      <p class="pdf-result-title">{t('pdf.ready')}</p>
      {children}
      <ul class="file-list">
        {files.map((f) => (
          <li class="file-row" key={f.name}>
            <div class="file-info">
              <strong class="file-name">{f.name}</strong>
              <span class="muted">
                {f.note ? `${f.note} · ` : ''}
                {formatBytes(lang, f.blob.size)}
              </span>
            </div>
            <div class="file-actions">
              <button type="button" class="btn btn-small" onClick={() => downloadBlob(f.name, f.blob)}>
                {t('files.download')}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {files.length > 1 && zipName && (
        <div class="actions">
          <button type="button" class="btn" onClick={() => void downloadZip(zipName, files)}>
            {t('files.downloadAll')}
          </button>
        </div>
      )}
    </div>
  );
}
