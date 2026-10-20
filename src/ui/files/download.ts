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

/** Все файлы одним архивом. Картинки уже сжаты, поэтому без повторного сжатия (level 0) — быстро. */
export async function downloadZip(name: string, files: { name: string; blob: Blob }[]) {
  const { zipSync } = await loadZip();
  const names = uniqueNames(files.map((f) => f.name));
  const entries: Record<string, [Uint8Array, { level: 0 }]> = {};
  for (let i = 0; i < files.length; i++) entries[names[i]] = [new Uint8Array(await files[i].blob.arrayBuffer()), { level: 0 }];
  const zipped = zipSync(entries);
  downloadBlob(name, new Blob([new Uint8Array(zipped)], { type: 'application/zip' }));
}
