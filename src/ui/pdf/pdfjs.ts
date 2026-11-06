// pdf.js — отрисовка страниц (миниатюры, PDF → картинки) и извлечение текста.
// Сборка legacy: обычная требует самых свежих браузеров (Map.getOrInsertComputed, Math.sumPrecise).
// Файлы pdf.js подключаются как есть (?url) и грузятся только по требованию: ~150 КБ + воркер ~390 КБ gzip.
import pdfjsUrl from 'pdfjs-dist/legacy/build/pdf.min.mjs?url';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
// Декодеры JPEG 2000 и JBIG2 (часто встречаются в сканах) и два стандартных шрифта, которых нет в системе.
// Остальные стандартные шрифты при useSystemFonts заменяются системными.
import openjpegUrl from 'pdfjs-dist/wasm/openjpeg.wasm?url';
import jbig2Url from 'pdfjs-dist/wasm/jbig2.wasm?url';
import symbolUrl from 'pdfjs-dist/standard_fonts/FoxitSymbol.pfb?url';
import dingbatsUrl from 'pdfjs-dist/standard_fonts/FoxitDingbats.pfb?url';
import type * as PdfJs from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export type { PDFDocumentProxy, PDFPageProxy };

const ASSETS: Record<string, string> = {
  'openjpeg.wasm': openjpegUrl,
  'jbig2.wasm': jbig2Url,
  'FoxitSymbol.pfb': symbolUrl,
  'FoxitDingbats.pfb': dingbatsUrl,
};

/** Отдаёт pdf.js вспомогательные файлы по именам: у собранных файлов в имени хеш, общей папки нет. */
class BinaryDataFactory {
  async fetch({ filename }: { kind: string; filename: string }): Promise<Uint8Array> {
    const url = ASSETS[filename];
    if (!url) throw new Error(`pdf.js asset ${filename} is not bundled`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`pdf.js asset ${filename}: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
}

let lib: Promise<typeof PdfJs> | null = null;

/** Загружает pdf.js (один раз). При ошибке следующий вызов попробует снова. */
export function loadPdfJs(): Promise<typeof PdfJs> {
  lib ??= (import(/* @vite-ignore */ pdfjsUrl) as Promise<typeof PdfJs>).then(
    (m) => {
      m.GlobalWorkerOptions.workerSrc = workerUrl;
      return m;
    },
    (e) => {
      lib = null;
      throw e;
    },
  );
  return lib;
}

// Один воркер на страницу: без него pdf.js запускает свой воркер (и заново разбирает 1,3 МБ его кода)
// на каждый документ — на каждый файл в объединении и каждое обновление превью.
let worker: InstanceType<(typeof PdfJs)['PDFWorker']> | null = null;
function sharedWorker(pdfjs: typeof PdfJs) {
  if (!worker || worker.destroyed) worker = new pdfjs.PDFWorker();
  return worker;
}

/** Неверный или отсутствующий пароль у защищённого файла. */
export class PdfPasswordError extends Error {
  constructor(public wrong: boolean) {
    super(wrong ? 'wrong password' : 'password required');
  }
}

/** Открывает PDF для отрисовки. Буфер копируется: pdf.js забирает переданный в воркер. */
export async function openForRender(bytes: Uint8Array, password?: string): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    worker: sharedWorker(pdfjs),
    verbosity: 0,
    password,
    BinaryDataFactory,
    useWorkerFetch: false,
    // Непустые адреса нужны, чтобы pdf.js вообще обращался к фабрике.
    standardFontDataUrl: 'bundled/',
    wasmUrl: 'bundled/',
  });
  try {
    return await task.promise;
  } catch (e) {
    if ((e as { name?: string }).name === 'PasswordException') {
      throw new PdfPasswordError((e as { code?: number }).code === pdfjs.PasswordResponses.INCORRECT_PASSWORD);
    }
    throw e;
  }
}

/**
 * Рисует страницу на canvas так, чтобы длинная сторона была не больше maxSide точек
 * (или в масштабе scale, если он задан). Поворот страницы учитывается.
 */
export async function renderPage(
  page: PDFPageProxy,
  opts: { maxSide?: number; scale?: number; background?: string },
): Promise<HTMLCanvasElement> {
  const base = page.getViewport({ scale: 1 });
  const scale = opts.scale ?? (opts.maxSide ?? 200) / Math.max(base.width, base.height);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  await page.render({ canvas, viewport, background: opts.background ?? '#ffffff' }).promise;
  return canvas;
}
