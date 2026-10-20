// Декодирование HEIC в воркере. Воркер и libheif (~0,5 МБ gzip) загружаются только при первом файле.
import glueUrl from 'libheif-js/libheif-wasm/libheif.js?url';
import wasmUrl from 'libheif-js/libheif-wasm/libheif.wasm?url';
import { isHeif } from './heif';

// Сообщения между главным потоком и воркером.
export type WorkerRequest =
  | { type: 'init'; glueUrl: string; wasmUrl: string }
  | { type: 'decode'; buffer: ArrayBuffer; maxPixels: number };
export type DecodeError = 'broken' | 'tooLarge' | 'memory';
export type WorkerMessage =
  | { type: 'ready' }
  | { type: 'failed' }
  | { type: 'done'; width: number; height: number; data: Uint8ClampedArray }
  /** fatal — модуль wasm после ошибки непригоден (например, кончилась память), воркер нужно пересоздать. */
  | { type: 'error'; error: DecodeError; fatal?: boolean };

/** Больше — не декодируем: не хватит памяти вкладки. Фото iPhone 48 Мп проходят. */
export const MAX_PIXELS = 100_000_000;

export class HeicError extends Error {
  constructor(public code: DecodeError | 'notHeic' | 'load' | 'skipped') {
    super(code);
  }
}

let ready: Promise<Worker> | null = null;

/** Запускает воркер и ждёт, пока загрузится и скомпилируется wasm. При ошибке следующий вызов попробует снова. */
export function loadDecoder(): Promise<Worker> {
  ready ??= new Promise<Worker>((resolve, reject) => {
    const worker = new Worker(new URL('./heic.worker.ts', import.meta.url));
    const fail = () => {
      worker.terminate();
      ready = null;
      reject(new HeicError('load'));
    };
    worker.onerror = fail;
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => (e.data.type === 'ready' ? resolve(worker) : fail());
    const init: WorkerRequest = { type: 'init', glueUrl, wasmUrl };
    worker.postMessage(init);
  });
  return ready;
}

async function run(file: File): Promise<ImageData> {
  if (!isHeif(new Uint8Array(await file.slice(0, 64).arrayBuffer()))) throw new HeicError('notHeic');
  const worker = await loadDecoder();
  const buffer = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    // Воркер упал целиком — пересоздаём при следующем файле.
    const crash = (code: DecodeError) => {
      worker.terminate();
      ready = null;
      reject(new HeicError(code));
    };
    worker.onerror = () => crash('memory');
    worker.onmessage = ({ data: m }: MessageEvent<WorkerMessage>) => {
      if (m.type === 'done') resolve(new ImageData(m.data as Uint8ClampedArray<ArrayBuffer>, m.width, m.height));
      else if (m.type === 'error' && m.fatal) crash(m.error);
      else reject(new HeicError(m.type === 'error' ? m.error : 'broken'));
    };
    const req: WorkerRequest = { type: 'decode', buffer, maxPixels: MAX_PIXELS };
    worker.postMessage(req, [buffer]);
  });
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Файлы декодируются строго по одному (память и предсказуемый порядок).
 * isStale — задача устарела, пока ждала очереди (например, сменили качество и файл уже поставлен заново).
 */
export function decodeHeic(file: File, isStale: () => boolean = () => false): Promise<ImageData> {
  const job = queue.then(() => {
    if (isStale()) throw new HeicError('skipped');
    return run(file);
  });
  queue = job.catch(() => {});
  return job;
}
