// Открытый пользователем PDF: байты, пароль и документ pdf.js для миниатюр.
import { openForRender, PdfPasswordError, renderPage, type PDFDocumentProxy } from './pdfjs';

export interface PdfSource {
  id: number;
  file: File;
  bytes: Uint8Array;
  /** Пароль, с которым файл открылся (для pdf-lib при сохранении). */
  password?: string;
  doc: PDFDocumentProxy;
  pageCount: number;
}

export type OpenResult = { ok: true; source: PdfSource } | { ok: false; error: 'password' | 'wrongPassword' | 'broken' | 'load' };

let nextId = 1;

/** Открывает файл для показа. Ошибки — кодом: интерфейс решает, спросить пароль или показать сообщение. */
export async function openSource(file: File, password?: string, bytes?: Uint8Array): Promise<OpenResult> {
  const data = bytes ?? new Uint8Array(await file.arrayBuffer());
  try {
    const doc = await openForRender(data, password);
    return { ok: true, source: { id: nextId++, file, bytes: data, password, doc, pageCount: doc.numPages } };
  } catch (e) {
    if (e instanceof PdfPasswordError) return { ok: false, error: e.wrong ? 'wrongPassword' : 'password' };
    // Не загрузился сам pdf.js (сеть) — это не ошибка файла.
    if (e instanceof TypeError && /import|fetch|module/i.test(e.message)) return { ok: false, error: 'load' };
    return { ok: false, error: 'broken' };
  }
}

/** Закрыть документ и освободить миниатюры. */
export function closeSource(s: PdfSource) {
  const urls = thumbs.get(s.doc);
  thumbs.delete(s.doc);
  urls?.forEach((p) => p.then((u) => URL.revokeObjectURL(u), () => {}));
  void s.doc.loadingTask.destroy();
}

// Миниатюры: по одной отрисовке за раз (воркер pdf.js один), результат — URL картинки, кешируется.
const thumbs = new WeakMap<PDFDocumentProxy, Map<number, Promise<string>>>();
let queue: Promise<unknown> = Promise.resolve();

/** Миниатюра страницы (номер с 0): длинная сторона THUMB точек. */
export const THUMB = 320;

export function thumbnail(doc: PDFDocumentProxy, index: number): Promise<string> {
  let map = thumbs.get(doc);
  if (!map) thumbs.set(doc, (map = new Map()));
  let p = map.get(index);
  if (!p) {
    p = queue.then(async () => {
      const page = await doc.getPage(index + 1);
      const canvas = await renderPage(page, { maxSide: THUMB });
      page.cleanup();
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.8));
      if (!blob) throw new Error('thumbnail');
      return URL.createObjectURL(blob);
    });
    queue = p.catch(() => {});
    map.set(index, p);
  }
  return p;
}
