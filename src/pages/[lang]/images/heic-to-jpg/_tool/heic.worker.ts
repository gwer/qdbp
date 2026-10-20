// Воркер: декодирует HEIC в RGBA через libheif (wasm), чтобы не подвешивать вкладку.
// libheif (LGPL-3.0) подключается как есть, отдельными файлами из пакета libheif-js — не смешивается
// с нашим кодом в один бандл, его можно заменить. Лицензия и исходники — public/licenses/libheif.txt.
// Воркер классический (нужен importScripts для UMD-обвязки libheif), поэтому в нём нет ни одного import
// и export, даже для типов (иначе в dev-сборке он становится модулем): адреса файлов присылает главный поток.
type WorkerMessage = import('./decoder').WorkerMessage;
type WorkerRequest = import('./decoder').WorkerRequest;

interface HeifImage {
  get_width(): number;
  get_height(): number;
  is_primary(): boolean;
  display(target: { data: Uint8ClampedArray; width: number; height: number }, done: (result: unknown) => void): void;
  free(): void;
}
interface LibHeif {
  HeifDecoder: new () => { decoder: number; decode(data: Uint8Array): HeifImage[] };
  heif_context_free(ctx: number): void;
}

const scope = self as unknown as {
  importScripts(url: string): void;
  libheif: (opts: { locateFile: () => string; onRuntimeInitialized: (this: LibHeif) => void; onAbort: (e: unknown) => void }) => unknown;
  postMessage(msg: WorkerMessage, transfer?: Transferable[]): void;
  onmessage: (e: MessageEvent<WorkerRequest>) => void;
};
const post = (msg: WorkerMessage, transfer?: Transferable[]) => scope.postMessage(msg, transfer);

let lib: Promise<LibHeif>;

scope.onmessage = async ({ data: msg }) => {
  if (msg.type === 'init') {
    // Фабрика emscripten возвращает модуль сразу, а готовность (wasm скачан и скомпилирован) сообщает колбэком.
    lib = new Promise<LibHeif>((resolve, reject) => {
      scope.importScripts(msg.glueUrl);
      scope.libheif({
        locateFile: () => msg.wasmUrl,
        onRuntimeInitialized(this: LibHeif) {
          resolve(this);
        },
        onAbort: reject,
      });
    });
    lib.then(
      () => post({ type: 'ready' }),
      () => post({ type: 'failed' }),
    );
    return;
  }
  const { buffer, maxPixels } = msg;
  const heif = await lib;
  const decoder = new heif.HeifDecoder();
  let images: HeifImage[] = [];
  try {
    images = decoder.decode(new Uint8Array(buffer));
    // Несколько кадров (серия, глубина и т. п.) — берём основное изображение.
    const image = images.find((i) => i.is_primary()) ?? images[0];
    if (!image) return post({ type: 'error', error: 'broken' });
    // Размеры — уже с учётом поворота и отражения из файла: libheif применяет их при декодировании.
    const width = image.get_width();
    const height = image.get_height();
    if (width * height > maxPixels) return post({ type: 'error', error: 'tooLarge' });
    let data: Uint8ClampedArray;
    try {
      data = new Uint8ClampedArray(width * height * 4);
    } catch {
      return post({ type: 'error', error: 'memory' });
    }
    const ok = await new Promise((resolve) => image.display({ data, width, height }, resolve));
    if (!ok) return post({ type: 'error', error: 'broken' });
    post({ type: 'done', width, height, data }, [data.buffer]);
  } catch {
    // Исключение внутри wasm (чаще всего нехватка памяти) — состояние модуля не гарантировано.
    post({ type: 'error', error: 'memory', fatal: true });
  } finally {
    try {
      images.forEach((i) => i.free());
      if (decoder.decoder) heif.heif_context_free(decoder.decoder);
    } catch {
      // модуль уже в аварийном состоянии
    }
  }
};
