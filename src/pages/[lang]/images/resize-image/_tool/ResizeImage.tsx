import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { IntField, QualityField, SelectField } from '@/ui/files/fields';
import { decode, encode, LOSSY, outputName, sameType, type OutputType } from '@/ui/files/image';
import { ImageBatch, type Processed } from '@/ui/files/ImageBatch';
import { coverCrop, targetSize, type ResizeMode } from '@/ui/files/size';

type Format = 'same' | 'image/jpeg' | 'image/webp' | 'image/png';

export function ResizeImage({ lang, t }: ToolProps) {
  const [mode, setMode] = useState<ResizeMode>('width');
  const [percent, setPercent] = useState(50);
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(1280);
  const [noUpscale, setNoUpscale] = useState(true);
  const [format, setFormat] = useState<Format>('same');
  const [quality, setQuality] = useState(85);

  const process = async (file: File): Promise<Processed> => {
    const bitmap = await decode(file);
    let cropped: ImageBitmap | null = null;
    try {
      const type: OutputType = format === 'same' ? sameType(file) : format;
      let source = bitmap;
      let size = targetSize(bitmap.width, bitmap.height, { mode, percent, width, height, noUpscale });
      if (mode === 'cover') {
        // Сначала вырезаем центральную область нужных пропорций, потом масштабируем её целиком.
        const c = coverCrop(bitmap.width, bitmap.height, width, height, noUpscale);
        source = cropped = await createImageBitmap(bitmap, c.crop.x, c.crop.y, c.crop.width, c.crop.height);
        size = c.size;
      }
      const blob = await encode(source, { ...size, type, quality: quality / 100 });
      return { blob, name: outputName(file.name, type, `-${size.width}x${size.height}`), ...size, srcWidth: bitmap.width, srcHeight: bitmap.height };
    } finally {
      bitmap.close();
      cropped?.close();
    }
  };

  const lossy = format === 'same' || LOSSY.has(format);
  return (
    <div>
      <div class="calc-inputs">
        <SelectField
          id="rs-mode"
          label={t('ui.mode')}
          value={mode}
          options={(['width', 'height', 'fit', 'cover', 'percent'] as const).map((m) => [m, t(`ui.modes.${m}`)])}
          onChange={setMode}
        />
        {mode === 'percent' && <IntField id="rs-percent" label={t('ui.percent')} value={percent} min={1} max={1000} suffix="%" onChange={setPercent} />}
        {(mode === 'width' || mode === 'fit' || mode === 'cover') && <IntField id="rs-width" label={t('ui.width')} value={width} min={1} max={20000} suffix="px" onChange={setWidth} />}
        {(mode === 'height' || mode === 'fit' || mode === 'cover') && <IntField id="rs-height" label={t('ui.height')} value={height} min={1} max={20000} suffix="px" onChange={setHeight} />}
        <SelectField
          id="rs-format"
          label={t('ui.format')}
          value={format}
          options={[
            ['same', t('ui.formats.same')],
            ['image/jpeg', 'JPG'],
            ['image/webp', 'WebP'],
            ['image/png', 'PNG'],
          ]}
          onChange={setFormat}
        />
        {lossy && <QualityField id="rs-quality" label={t('ui.quality')} value={quality} onChange={setQuality} />}
      </div>
      {mode !== 'percent' && (
        <div class="checks">
          <label>
            <input type="checkbox" checked={noUpscale} onChange={() => setNoUpscale(!noUpscale)} />
            {t('ui.noUpscale')}
          </label>
        </div>
      )}
      <ImageBatch t={t} lang={lang} process={process} optionsKey={[mode, percent, width, height, noUpscale, format, quality].join()} zipName="resized-images.zip" />
    </div>
  );
}
