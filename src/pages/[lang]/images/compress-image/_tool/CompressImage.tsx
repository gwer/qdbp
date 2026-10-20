import { useState } from 'preact/hooks';
import type { ToolProps } from '@/ui/define';
import { QualityField, SelectField } from '@/ui/files/fields';
import { decode, encode, outputName, type OutputType } from '@/ui/files/image';
import { ImageBatch, type Processed } from '@/ui/files/ImageBatch';
import { compressedType, type Target } from './target';

export function CompressImage({ lang, t }: ToolProps) {
  const [quality, setQuality] = useState(75);
  const [target, setTarget] = useState<Target>('auto');

  const process = async (file: File): Promise<Processed> => {
    const bitmap = await decode(file);
    try {
      const size = { width: bitmap.width, height: bitmap.height };
      const type: OutputType = compressedType(file.type, target);
      const blob = await encode(bitmap, { ...size, type, quality: quality / 100 });
      // Если «сжатый» файл вышел больше исходника того же формата — честно оставляем исходник.
      const keep = blob.size >= file.size && type === file.type;
      return {
        blob: keep ? file : blob,
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
        <QualityField id="cp-quality" label={t('ui.quality')} value={quality} onChange={setQuality} />
        <SelectField
          id="cp-target"
          label={t('ui.target')}
          value={target}
          options={(['auto', 'image/jpeg', 'image/webp'] as const).map((v) => [v, t(`ui.targets.${v === 'auto' ? 'auto' : v === 'image/jpeg' ? 'jpeg' : 'webp'}`)])}
          onChange={setTarget}
        />
      </div>
      <p class="muted">{t('ui.pngNote')}</p>
      <ImageBatch t={t} lang={lang} process={process} optionsKey={[quality, target].join()} zipName="compressed-images.zip" />
    </div>
  );
}
