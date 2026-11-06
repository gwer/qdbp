// pdf-lib (форк @cantoo/pdf-lib: поддерживается, умеет шифрование) — сборка, правка и сохранение PDF.
// ~250 КБ gzip: загружается в фоне, когда браузер свободен, или при первом файле.
import type * as PdfLib from '@cantoo/pdf-lib';
import type { PDFDocument } from '@cantoo/pdf-lib';

export type { PDFDocument };

let lib: Promise<typeof PdfLib> | null = null;

export function loadPdfLib(): Promise<typeof PdfLib> {
  lib ??= import('@cantoo/pdf-lib').catch((e) => {
    lib = null;
    throw e;
  });
  return lib;
}

/** Начать загрузку заранее, когда браузер свободен (если не включена экономия трафика). */
export function preloadPdfLib() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return;
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
  (w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500)))(() => void loadPdfLib().catch(() => {}));
}

/** Файл открывается только с паролем (password: null — пароль не передавали). */
export class NeedsPasswordError extends Error {
  constructor(public wrong: boolean) {
    super(wrong ? 'wrong password' : 'password required');
  }
}

/** Файл не читается как PDF. */
export class BrokenPdfError extends Error {}

/**
 * Открывает PDF для правки. Защищённый только паролем владельца (запрет печати, копирования) открывается
 * пустым паролем открытия и сохраняется уже без защиты. Пароль открытия — NeedsPasswordError.
 */
export async function openPdf(bytes: Uint8Array, password?: string): Promise<PDFDocument> {
  const { PDFDocument, EncryptedPDFError } = await loadPdfLib();
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (e) {
    if (!(e instanceof EncryptedPDFError)) throw new BrokenPdfError(String(e));
  }
  try {
    return await PDFDocument.load(bytes, { password: password ?? '', updateMetadata: false });
  } catch (e) {
    const msg = String((e as Error)?.message);
    if (/password/i.test(msg)) throw new NeedsPasswordError(password !== undefined && /incorrect/i.test(msg));
    throw new BrokenPdfError(msg);
  }
}

/** Сохранённый документ как Blob. */
export async function saveBlob(doc: PDFDocument): Promise<Blob> {
  const bytes = await doc.save();
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

export const isPdf = (file: File) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

/** Имя результата: «report.pdf» → «report-merged.pdf». */
export function pdfName(name: string, suffix = '', ext = 'pdf'): string {
  const base = name.replace(/\.[^.]+$/, '') || 'document';
  return `${base}${suffix}.${ext}`;
}
