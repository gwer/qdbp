export function downloadBlob(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** Уникальные имена в архиве: photo.jpg, photo (2).jpg … */
export function uniqueNames(names: string[]): string[] {
  const original = new Set(names);
  const taken = new Set<string>();
  return names.map((n) => {
    const dot = n.lastIndexOf('.');
    let name = n;
    // Номер не должен совпасть ни с выданным, ни с исходным именем другого файла («a (2).jpg» рядом с двумя «a.jpg»)
    for (let i = 2; taken.has(name) || (name !== n && original.has(name)); i++) {
      name = dot > 0 ? `${n.slice(0, dot)} (${i})${n.slice(dot)}` : `${n} (${i})`;
    }
    taken.add(name);
    return name;
  });
}

const loadZip = () => import('fflate');

/** Библиотека zip (~8 КБ) подгружается заранее, когда браузер свободен, — если не включена экономия трафика. */
export function preloadZip() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return;
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
  const idle = w.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
  idle(() => void loadZip());
}

/**
 * Все файлы одним архивом. Картинки и PDF уже сжаты, поэтому без повторного сжатия — быстро.
 * Архив собирается по частям, без одного большого буфера: сотни страниц PNG не удваивают расход памяти.
 */
export async function downloadZip(name: string, files: { name: string; blob: Blob }[]) {
  const { Zip, ZipPassThrough } = await loadZip();
  const names = uniqueNames(files.map((f) => f.name));
  const parts: Uint8Array<ArrayBuffer>[] = [];
  const zip = new Zip((err, chunk) => {
    if (err) throw err;
    parts.push(chunk as Uint8Array<ArrayBuffer>);
  });
  for (let i = 0; i < files.length; i++) {
    const entry = new ZipPassThrough(names[i]);
    zip.add(entry);
    entry.push(new Uint8Array(await files[i].blob.arrayBuffer()), true);
  }
  zip.end();
  downloadBlob(name, new Blob(parts, { type: 'application/zip' }));
}
