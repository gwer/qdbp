// pdf-lib (форк @cantoo/pdf-lib: поддерживается, умеет шифрование) — сборка, правка и сохранение PDF.
// ~250 КБ gzip: загружается в фоне, когда браузер свободен, или при первом файле.
import type * as PdfLib from '@cantoo/pdf-lib';
import type { PDFDocument } from '@cantoo/pdf-lib';
import SITES from '@/sites.json';

export type { PDFDocument };

let lib: Promise<typeof PdfLib> | null = null;

export function loadPdfLib(): Promise<typeof PdfLib> {
  lib ??= import('@cantoo/pdf-lib').catch((e) => {
    lib = null;
    throw e;
  });
  return lib;
}

/** Выполнить, когда браузер свободен, — если не включена экономия трафика (тогда загрузка будет при первом файле). */
export function whenIdle(load: () => Promise<unknown>) {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return;
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
  (w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500)))(() => void load().catch(() => {}));
}

/** Начать загрузку pdf-lib заранее. */
export const preloadPdfLib = () => whenIdle(loadPdfLib);

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

const pad = (n: number) => String(n).padStart(2, '0');

/** Имя файла без расширения: «report.pdf» → «report». */
export const baseName = (name: string) => name.replace(/\.[^.]+$/, '') || 'document';

/**
 * Хвост имени результата: «_2026-11-07_14-32-05_tooloot.net». Время местное и до секунды — повторные
 * результаты не перезаписывают друг друга в «Загрузках»; у файлов одного запуска хвост общий.
 */
export function stamp(now = new Date()): string {
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `_${date}_${time}_${new URL(SITES.tools.url).host}`;
}

/** Имя результата: «report.pdf», «_compressed» → «report_compressed_2026-11-07_14-32-05_tooloot.net.pdf». */
export const pdfName = (name: string, suffix = '', ext = 'pdf', now = new Date()) => `${baseName(name)}${suffix}${stamp(now)}.${ext}`;
