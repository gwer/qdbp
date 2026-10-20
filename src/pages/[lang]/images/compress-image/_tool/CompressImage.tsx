import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { IntField, QualityField, SelectField } from '@/ui/files/fields';
import { decode, encode, outputName, type OutputType } from '@/ui/files/image';
import { ImageBatch, type Processed } from '@/ui/files/ImageBatch';
import { stripJpeg } from '@/ui/files/jpeg';
import { compressedType, fitToSize, type Target } from './target';

export function CompressImage({ lang, t }: ToolProps) {
  const [by, setBy] = useState<'quality' | 'size'>('quality');
  const [quality, setQuality] = useState(75);
  // Лимит в КБ: формы госуслуг, анкеты и почта часто требуют «не больше N КБ». Считаем КБ = 1000 байт, как в списке
  // файлов: если форма имеет в виду 1024, файл всё равно поместится.
  const [maxKb, setMaxKb] = useState(500);
  const [target, setTarget] = useState<Target>('auto');

  const process = async (file: File): Promise<Processed> => {
    const bitmap = await decode(file);
    try {
      const size = { width: bitmap.width, height: bitmap.height };
      const type: OutputType = compressedType(file.type, target);
      const blob =
        by === 'size'
          ? await fitToSize((q) => encode(bitmap, { ...size, type, quality: q }), maxKb * 1000)
          : await encode(bitmap, { ...size, type, quality: quality / 100 });
      // Если «сжатый» файл вышел не меньше исходника того же формата — честно оставляем исходник.
      // Из JPEG при этом без перекодирования вырезаем метаданные (EXIF, GPS, XMP, комментарии), как и при пересохранении.
      let original: Blob = file;
      if (type === file.type && type === 'image/jpeg') {
        original = new Blob([stripJpeg(new Uint8Array(await file.arrayBuffer()), { keepIcc: true, keepOrientation: true })], { type });
      }
      const keep = type === file.type && blob.size >= original.size;
      return {
        blob: keep ? original : blob,
        name: keep ? file.name : outputName(file.name, type, '-compressed'),
        ...size,
        srcWidth: size.width,
        srcHeight: size.height,
      };
    } finally {
      bitmap.close();
    }
  };

  return (
    <div>
      <div class="calc-inputs">
        <SelectField
          id="cp-by"
          label={t('ui.by')}
          value={by}
          options={[
            ['quality', t('ui.byQuality')],
            ['size', t('ui.bySize')],
          ]}
          onChange={setBy}
        />
        {by === 'quality' ? (
          <QualityField id="cp-quality" label={t('ui.quality')} value={quality} onChange={setQuality} />
        ) : (
          <IntField id="cp-size" label={t('ui.maxSize')} value={maxKb} min={10} max={100000} suffix={t('ui.kb')} onChange={setMaxKb} />
        )}
        <SelectField
          id="cp-target"
          label={t('ui.target')}
          value={target}
          options={(['auto', 'image/jpeg', 'image/webp'] as const).map((v) => [v, t(`ui.targets.${v === 'auto' ? 'auto' : v === 'image/jpeg' ? 'jpeg' : 'webp'}`)])}
          onChange={setTarget}
        />
      </div>
      <p class="muted">{t('ui.pngNote')}</p>
      <ImageBatch t={t} lang={lang} process={process} optionsKey={[by, quality, maxKb, target].join()} zipName="compressed-images.zip" compare />
    </div>
  );
}
