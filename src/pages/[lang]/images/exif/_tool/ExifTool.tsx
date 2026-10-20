import { useState } from 'preact/hooks';
import { formatNumber } from '@/lib/format';
import type { ToolProps } from '@/ui/define';
import { formatBytes } from '@/ui/files/bytes';
import { downloadBlob, downloadZip } from '@/ui/files/download';
import { DropZone } from '@/ui/files/DropZone';
import { isJpeg, readMeta, stripJpeg, type Meta } from '@/ui/files/jpeg';

interface Item {
  id: number;
  file: File;
  bytes?: Uint8Array;
  meta?: Meta;
  /** notJpeg — формат без поддержки; broken — JPEG, который не удалось разобрать. */
  problem?: 'notJpeg' | 'broken';
}

let nextId = 1;

const exifDate = (s?: string) => s?.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');

export function ExifTool({ lang, t }: ToolProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [keepIcc, setKeepIcc] = useState(true);
  const [keepOrientation, setKeepOrientation] = useState(true);

  const add = async (files: File[]) => {
    const fresh = await Promise.all(
      files.map(async (file): Promise<Item> => {
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!isJpeg(bytes)) return { id: nextId++, file, problem: 'notJpeg' };
        try {
          stripJpeg(bytes, { keepIcc: true, keepOrientation: false }); // разбор всего файла: битый не дойдёт до рендера
          return { id: nextId++, file, bytes, meta: readMeta(bytes) };
        } catch {
          return { id: nextId++, file, problem: 'broken' };
        }
      }),
    );
    setItems((cur) => [...cur, ...fresh]);
  };

  const cleaned = (i: Item) => {
    const out = stripJpeg(i.bytes!, { keepIcc, keepOrientation });
    return { name: i.file.name.replace(/(\.[^.]+)?$/, (ext) => `-clean${ext || '.jpg'}`), blob: new Blob([out], { type: 'image/jpeg' }) };
  };
  const ready = items.filter((i) => i.meta);
  const num = (n: number, digits = 1) => formatNumber(lang, n, 'number', digits);

  return (
    <div>
      <DropZone t={t} accept="image/*" onFiles={add} />
      <div class="checks">
        <label>
          <input type="checkbox" checked={keepOrientation} onChange={() => setKeepOrientation(!keepOrientation)} />
          {t('ui.keepOrientation')}
        </label>
        <label>
          <input type="checkbox" checked={keepIcc} onChange={() => setKeepIcc(!keepIcc)} />
          {t('ui.keepIcc')}
        </label>
      </div>
      {items.map((i) => {
        const m = i.meta;
        const rows: [string, string][] = [];
        if (m) {
          // «Canon» + «Canon EOS R5» → «Canon EOS R5», «Apple» + «iPhone 15» → «Apple iPhone 15».
          const camera = m.make && m.model ? (m.model.startsWith(m.make) ? m.model : `${m.make} ${m.model}`) : (m.model ?? m.make);
          if (camera) rows.push([t('ui.fields.camera'), camera]);
          if (m.lens) rows.push([t('ui.fields.lens'), m.lens]);
          if (m.dateTimeOriginal) rows.push([t('ui.fields.taken'), exifDate(m.dateTimeOriginal)!]);
          if (m.dateTime && m.dateTime !== m.dateTimeOriginal) rows.push([t('ui.fields.modified'), exifDate(m.dateTime)!]);
          if (m.exposure) rows.push([t('ui.fields.exposure'), `${m.exposure} s`]);
          if (m.fNumber) rows.push([t('ui.fields.aperture'), `f/${num(m.fNumber)}`]);
          if (m.iso) rows.push(['ISO', String(m.iso)]);
          if (m.focalLength) rows.push([t('ui.fields.focal'), `${num(m.focalLength)} mm`]);
          if (m.software) rows.push([t('ui.fields.software'), m.software]);
          if (m.artist) rows.push([t('ui.fields.artist'), m.artist]);
          if (m.copyright) rows.push([t('ui.fields.copyright'), m.copyright]);
          if (m.serial) rows.push([t('ui.fields.serial'), m.serial]);
          if (m.orientation && m.orientation !== 1) rows.push([t('ui.fields.orientation'), String(m.orientation)]);
        }
        const blocks = m ? (['xmp', 'iptc', 'comment', 'icc'] as const).filter((k) => m[k]).map((k) => t(`ui.blocks.${k}`)) : [];
        const result = m ? cleaned(i) : null;
        return (
          <section class="exif-card" key={i.id}>
            <h3 class="file-name">
              {i.file.name} <span class="muted">· {formatBytes(lang, i.file.size)}</span>
            </h3>
            {i.problem && <p class="muted">{t(i.problem === 'notJpeg' ? 'ui.notJpeg' : 'ui.broken')}</p>}
            {m?.gps && (
              <p class="exif-gps">
                <strong>{t('ui.gpsWarning')}</strong>{' '}
                {num(m.gps.lat, 6)}, {num(m.gps.lon, 6)}
                {m.gps.alt !== undefined && ` · ${num(m.gps.alt, 0)} m`}{' '}
                <a href={`https://www.openstreetmap.org/?mlat=${m.gps.lat}&mlon=${m.gps.lon}#map=16/${m.gps.lat}/${m.gps.lon}`} target="_blank" rel="noopener noreferrer">
                  {t('ui.map')}
                </a>
              </p>
            )}
            {rows.length > 0 && (
              <div class="table-wrap">
                <table class="exif-table">
                  <tbody>
                    {rows.map(([k, v]) => (
                      <tr key={k}>
                        <td>{k}</td>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {blocks.length > 0 && (
              <p class="muted">
                {t('ui.alsoFound')}: {blocks.join(', ')}
              </p>
            )}
            {m && !rows.length && !m.gps && !blocks.length && <p class="muted">{t('ui.none')}</p>}
            {result && (
              <div class="actions">
                <button type="button" class="btn btn-small" onClick={() => downloadBlob(result.name, result.blob)}>
                  {t('ui.download')}
                </button>
                <span class="muted">{t('ui.cleanSize', { size: formatBytes(lang, result.blob.size) })}</span>
              </div>
            )}
          </section>
        );
      })}
      {items.length > 0 && (
        <div class="actions">
          {ready.length > 1 && (
            <button type="button" class="btn btn-small" onClick={() => downloadZip('clean-photos.zip', ready.map(cleaned))}>
              {t('files.downloadAll')}
            </button>
          )}
          <button type="button" class="btn btn-secondary btn-small" onClick={() => setItems([])}>
            {t('files.clear')}
          </button>
        </div>
      )}
    </div>
  );
}
