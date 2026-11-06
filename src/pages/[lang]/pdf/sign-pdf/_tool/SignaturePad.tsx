import { useEffect, useRef, useState } from 'preact/hooks';
import { Toggle } from '@/ui/Calculator';
import type { T } from '@/i18n/t';
import { decode } from '@/ui/files/image';

/** Готовая подпись: PNG с прозрачным фоном, обрезанный по содержимому. */
export interface Signature {
  png: Uint8Array;
  url: string;
  width: number;
  height: number;
}

type Mode = 'draw' | 'type' | 'upload';
const COLORS = ['#111111', '#1a3d9c'];
const FONTS = [
  // Рукописные шрифты есть не везде: список от macOS и Windows к запасному cursive.
  "'Snell Roundhand', 'Segoe Script', 'Brush Script MT', 'URW Chancery L', cursive",
  "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Comic Neue', cursive",
  "Georgia, 'Times New Roman', 'Liberation Serif', serif",
];

/** Обрезает прозрачные поля (с отступом pad) и сохраняет в PNG. */
async function trimToPng(canvas: HTMLCanvasElement, pad = 8): Promise<Signature | null> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(width - 1, x1 + pad);
  y1 = Math.min(height - 1, y1 + pad);
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext('2d')!.drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  const blob = await new Promise<Blob | null>((r) => out.toBlob(r, 'image/png'));
  if (!blob) return null;
  return { png: new Uint8Array(await blob.arrayBuffer()), url: URL.createObjectURL(blob), width: out.width, height: out.height };
}

/** Рисование пальцем или мышью. */
function DrawPad({ t, color, onCanvas }: { t: T; color: string; onCanvas: (c: HTMLCanvasElement, empty: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const last = useRef<[number, number] | null>(null);
  const [empty, setEmpty] = useState(true);
  const point = (e: PointerEvent): [number, number] => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height];
  };
  const clear = () => {
    const c = ref.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
    onCanvas(c, true);
  };
  useEffect(clear, []);
  useEffect(() => {
    // Новый цвет — для уже нарисованного тоже.
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'source-over';
    onCanvas(c, empty);
  }, [color]);
  return (
    <div class="sig-pad">
      <canvas
        ref={ref}
        width={1200}
        height={400}
        aria-label={t('ui.drawHere')}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          last.current = point(e);
        }}
        onPointerMove={(e) => {
          if (!last.current) return;
          const ctx = ref.current!.getContext('2d')!;
          const p = point(e);
          ctx.strokeStyle = color;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(...last.current);
          ctx.lineTo(...p);
          ctx.stroke();
          last.current = p;
          if (empty) setEmpty(false);
        }}
        onPointerUp={() => {
          last.current = null;
          onCanvas(ref.current!, empty);
        }}
        onPointerCancel={() => (last.current = null)}
      />
      {empty && <span class="sig-hint">{t('ui.drawHere')}</span>}
      <button type="button" class="btn btn-secondary btn-small sig-clear" onClick={clear}>
        {t('ui.clear')}
      </button>
    </div>
  );
}

/** Создание подписи: нарисовать, напечатать или загрузить картинку. */
export function SignaturePad({ t, onDone }: { t: T; onDone: (s: Signature) => void }) {
  const [mode, setMode] = useState<Mode>('draw');
  const [color, setColor] = useState(COLORS[0]);
  const [name, setName] = useState('');
  const [font, setFont] = useState(0);
  const [drawn, setDrawn] = useState<HTMLCanvasElement | null>(null);
  const [upload, setUpload] = useState<{ file: File; clean: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typed = (f: number) => {
    const c = document.createElement('canvas');
    c.width = 1400;
    c.height = 360;
    const ctx = c.getContext('2d')!;
    ctx.font = `${f === 2 ? 'italic ' : ''}150px ${FONTS[f]}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(name.trim(), 30, 180, 1340);
    return c;
  };

  const fromUpload = async (file: File, clean: boolean) => {
    const bitmap = await decode(file);
    const k = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bitmap.width * k);
    c.height = Math.round(bitmap.height * k);
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(bitmap, 0, 0, c.width, c.height);
    bitmap.close();
    if (clean) {
      // Светлый фон (бумага на фото) — в прозрачность, плавно, чтобы края штрихов не были рваными.
      const img = ctx.getImageData(0, 0, c.width, c.height);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const light = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
        d[i + 3] = Math.round(d[i + 3] * Math.min(1, Math.max(0, (0.85 - light) / 0.25)));
      }
      ctx.putImageData(img, 0, 0);
    }
    return c;
  };

  const done = async () => {
    setError(null);
    try {
      const canvas = mode === 'draw' ? drawn : mode === 'type' ? typed(font) : upload && (await fromUpload(upload.file, upload.clean));
      const sig = canvas && (await trimToPng(canvas));
      if (!sig) return setError(t('ui.emptySig'));
      onDone(sig);
    } catch {
      setError(t('ui.badImage'));
    }
  };

  const ready = mode === 'draw' ? !!drawn : mode === 'type' ? !!name.trim() : !!upload;
  return (
    <div class="sig-maker">
      <Toggle
        label={t('ui.how')}
        value={mode}
        options={[
          ['draw', t('ui.modes.draw')],
          ['type', t('ui.modes.type')],
          ['upload', t('ui.modes.upload')],
        ]}
        onChange={(m) => (setMode(m), setError(null))}
      />
      {mode !== 'upload' && (
        <div class="calc-options" role="group" aria-label={t('ui.color')}>
          <span>{t('ui.color')}</span>
          {COLORS.map((c, i) => (
            <button key={c} type="button" aria-pressed={color === c} onClick={() => setColor(c)}>
              <span class="sig-swatch" style={{ background: c }} /> {t(i ? 'ui.blue' : 'ui.black')}
            </button>
          ))}
        </div>
      )}
      {mode === 'draw' && <DrawPad t={t} color={color} onCanvas={(c, empty) => setDrawn(empty ? null : c)} />}
      {mode === 'type' && (
        <>
          <div class="calc-inputs">
            <div class="field field-wide">
              <label for="sig-name">{t('ui.name')}</label>
              <input id="sig-name" type="text" autoComplete="name" value={name} maxLength={60} onInput={(e) => setName(e.currentTarget.value)} />
            </div>
          </div>
          <div class="sig-fonts" role="radiogroup" aria-label={t('ui.style')}>
            {FONTS.map((f, i) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={font === i}
                style={{ fontFamily: f, fontStyle: i === 2 ? 'italic' : undefined, color }}
                onClick={() => setFont(i)}
              >
                {name.trim() || t('ui.sample')}
              </button>
            ))}
          </div>
        </>
      )}
      {mode === 'upload' && (
        <div class="sig-upload">
          <input
            type="file"
            accept="image/*"
            aria-label={t('ui.modes.upload')}
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              setUpload(f ? { file: f, clean: upload?.clean ?? true } : null);
            }}
          />
          <label class="checks">
            <input type="checkbox" checked={upload?.clean ?? true} disabled={!upload} onChange={(e) => upload && setUpload({ ...upload, clean: e.currentTarget.checked })} />{' '}
            {t('ui.clean')}
          </label>
          <p class="muted">{t('ui.uploadHint')}</p>
        </div>
      )}
      {error && <p class="field-error">{error}</p>}
      <div class="actions">
        <button type="button" class="btn" disabled={!ready} onClick={() => void done()}>
          {t('ui.useSig')}
        </button>
      </div>
    </div>
  );
}
